/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/utils/supabase/admin'

function percentEncode(str: string) {
  return encodeURIComponent(str)
    .replace(/[!*']/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

function parseOAuthHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {}
  const prefix = 'OAuth '
  if (!header.startsWith(prefix)) return out
  const params = header.slice(prefix.length).split(',')
  for (const p of params) {
    const [k, v] = p.trim().split('=')
    if (k && v) out[k] = decodeURIComponent(v.replace(/"/g, ''))
  }
  return out
}

function buildBaseString(req: NextRequest, oauthParams: Record<string, string>): string {
  const url = new URL(req.url)
  const baseUrl = `${url.origin}${url.pathname}`

  // gather query params
  const queryPairs: [string, string][] = []
  url.searchParams.forEach((val, key) => {
    queryPairs.push([key, val])
  })

  // oauth params except signature
  Object.entries(oauthParams).forEach(([k, v]) => {
    if (k !== 'oauth_signature') queryPairs.push([k, v])
  })

  // sort
  queryPairs.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])))

  const paramString = queryPairs
    .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
    .join('&')

  return `${req.method.toUpperCase()}&${percentEncode(baseUrl)}&${percentEncode(paramString)}`
}

// Returns true if signature matches OR header absent (temporary until full verification confirmed)
function verifyOAuth1(req: NextRequest, consumerSecret: string): boolean {
  const authHeader = req.headers.get('authorization') || ''
  const params = parseOAuthHeader(authHeader)
  if (!params.oauth_signature) return true // TODO: remove this fallback once Garmin sends signed payloads

  const baseString = buildBaseString(req, params)
  const computed = crypto
    .createHmac('sha1', `${consumerSecret}&`)
    .update(baseString)
    .digest('base64')

  console.debug('[Garmin] Base string', baseString)
  console.debug('[Garmin] Computed sig', computed)
  console.debug('[Garmin] Garmin sig', params.oauth_signature)

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(params.oauth_signature))
}

export async function POST(request: NextRequest) {
  // --- Debugging: log signature details (remove once verified) ---
  const debugAuth = request.headers.get('authorization') || ''
  console.debug('[Garmin] Auth header', debugAuth)
  console.debug('[Garmin] Raw URL', request.url)
  const rawBody = await request.text()

  // Optional signature verification
  const consumerSecret = process.env.GARMIN_CLIENT_SECRET || ''
  if (consumerSecret && !verifyOAuth1(request, consumerSecret)) {
    return new NextResponse('invalid signature', { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new NextResponse('bad json', { status: 400 })
  }

  // Store raw payload for black-box debugging
  try {
    await (supabaseAdmin as any).from('wearable_event_raw').insert({ payload })
  } catch (e) {
    console.error('[Garmin] Failed to persist raw payload', e)
  }

  // Helper cache to avoid repeated DB look-ups during this request
  const connCache: Record<string, number | undefined> = {}

  async function getConnectionId(garminUserId: string): Promise<number | undefined> {
    if (connCache[garminUserId] !== undefined) return connCache[garminUserId]

    const { data } = await (supabaseAdmin as any)
      .from('wearable_connections')
      .select('id')
      .eq('wearable_user_id', garminUserId)
      .eq('wearable_type', 'garmin')
      .maybeSingle()

    connCache[garminUserId] = data?.id
    return data?.id
  }

  async function insertMetric(
    connId: number,
    metric: string,
    value: number,
    unit: string | null,
    ts: string | number,
  ) {
    await (supabaseAdmin as any).from('wearable_data').insert({
      connection_id: connId,
      metric_type: metric,
      value,
      unit,
      timestamp: typeof ts === 'number' ? new Date(ts * 1000).toISOString() : new Date(ts).toISOString(),
      source: 'garmin',
    }, { onConflict: 'connection_id,metric_type,timestamp' })
  }

  // If Garmin sends the old structure with a top-level `events` array we continue to support it.
  const eventWrappers: any[] = payload?.events ?? []

  // Newer Garmin pushes seem to include domain-specific arrays directly on the root
  if (Array.isArray(payload?.dailies)) {
    eventWrappers.push(...payload.dailies.map((d: any) => ({ dailies: d, userId: d.userId })))
  }

  if (Array.isArray(payload?.wellnessSleep)) {
    eventWrappers.push(...payload.wellnessSleep.map((s: any) => ({ wellnessSleep: s, userId: s.userId })))
  }

  if (Array.isArray(payload?.hrv)) {
    eventWrappers.push(...payload.hrv.map((h: any) => ({ hrv: h, userId: h.userId })))
  }

  if (Array.isArray(payload?.stress)) {
    eventWrappers.push(...payload.stress.map((st: any) => ({ stress: st, userId: st.userId })))
  }

  if (Array.isArray(payload?.respirationEpoch)) {
    eventWrappers.push(...payload.respirationEpoch.map((r: any) => ({ respirationEpoch: r, userId: r.userId })))
  }

  if (Array.isArray(payload?.allDayRespiration)) {
    // Flatten allDayRespiration summaries – compute average respiration rate for now.
    eventWrappers.push(
      ...payload.allDayRespiration.map((r: any) => {
        const breathsObj = r.timeOffsetEpochToBreaths || {}
        const breaths = Object.values(breathsObj)
        const avg = breaths.length ? (breaths as number[]).reduce((a, b) => a + (b as number), 0) / breaths.length : undefined
        return { allDayRespiration: { ...r, avgRespirationRate: avg }, userId: r.userId }
      }),
    )
  }

  for (const evt of eventWrappers) {
    const garminUserId = evt.userId
    if (!garminUserId) continue

    const connId = await getConnectionId(garminUserId)
    if (!connId) continue

    // Dailies
    if (evt.dailies) {
      const d = evt.dailies
      if (d.steps !== undefined) await insertMetric(connId, 'steps', d.steps, 'steps', d.startTimeInSeconds ?? Date.now() / 1000)
      if (d.activeKilocalories !== undefined)
        await insertMetric(connId, 'active_calories', d.activeKilocalories, 'kcal', d.startTimeInSeconds)
      if (d.floorsClimbed !== undefined)
        await insertMetric(connId, 'floors', d.floorsClimbed, 'floors', d.startTimeInSeconds)
    }

    // Wellness Sleep
    if (evt.wellnessSleep) {
      const s = evt.wellnessSleep
      if (s.totalSleepSeconds !== undefined)
        await insertMetric(connId, 'sleep_total_seconds', s.totalSleepSeconds, 's', s.calendarDate)
      if (s.deepSleepSeconds !== undefined)
        await insertMetric(connId, 'sleep_deep_seconds', s.deepSleepSeconds, 's', s.calendarDate)
      if (s.remSleepSeconds !== undefined)
        await insertMetric(connId, 'sleep_rem_seconds', s.remSleepSeconds, 's', s.calendarDate)
    }

    // HRV (using lastNightAvg as proxy for RMSSD)
    if (evt.hrv) {
      const h = evt.hrv
      if (h.lastNightAvg !== undefined) await insertMetric(connId, 'hrv_rmssd', h.lastNightAvg, 'ms', h.calendarDate ?? h.startTimeInSeconds)
    }

    // Stress summary
    if (evt.stress) {
      const st = evt.stress
      if (st.stressScore !== undefined) await insertMetric(connId, 'stress_score', st.stressScore, 'score', st.calendarDate)
    }

    // Respiration epoch (single value per event)
    if (evt.respirationEpoch) {
      const r = evt.respirationEpoch
      if (r.respirationRate !== undefined) await insertMetric(connId, 'respiration_rate', r.respirationRate, 'rpm', r.startTimeInSeconds)
    }

    // All-day respiration – store average breaths-per-min if we computed one
    if (evt.allDayRespiration) {
      const r = evt.allDayRespiration
      if (r.avgRespirationRate !== undefined)
        await insertMetric(connId, 'respiration_rate', r.avgRespirationRate, 'rpm', r.startTimeInSeconds)
    }
  }

  return new NextResponse('ok', { status: 200 })
} 