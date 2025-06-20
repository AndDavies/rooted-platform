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

  const events: any[] = payload?.events ?? []

  for (const evt of events) {
    const garminUserId = evt?.userId
    if (!garminUserId) continue

    // find wearable_connection for this garmin user
    const { data: conn } = await (supabaseAdmin as any)
      .from('wearable_connections')
      .select('id')
      .eq('wearable_user_id', garminUserId)
      .eq('wearable_type', 'garmin')
      .maybeSingle()

    if (!conn) continue

    async function insert(metric: string, value: number, unit: string | null, ts: string | number) {
      await (supabaseAdmin as any).from('wearable_data').insert({
        connection_id: conn.id,
        metric_type: metric,
        value,
        unit,
        timestamp: typeof ts === 'number' ? new Date(ts * 1000).toISOString() : new Date(ts).toISOString(),
        source: 'garmin',
      })
    }

    // WELLNESS_DAILY summary
    if (evt.dailies) {
      const d = evt.dailies
      if (d.steps !== undefined) await insert('steps', d.steps, 'steps', d.startTimeInSeconds ?? Date.now() / 1000)
      if (d.activeKilocalories !== undefined) await insert('active_calories', d.activeKilocalories, 'kcal', d.startTimeInSeconds)
      if (d.floorsClimbed !== undefined) await insert('floors', d.floorsClimbed, 'floors', d.startTimeInSeconds)
    }

    // WELLNESS_SLEEP summary
    if (evt.wellnessSleep) {
      const s = evt.wellnessSleep
      if (s.totalSleepSeconds !== undefined) await insert('sleep_total_seconds', s.totalSleepSeconds, 's', s.calendarDate)
      if (s.deepSleepSeconds !== undefined) await insert('sleep_deep_seconds', s.deepSleepSeconds, 's', s.calendarDate)
      if (s.remSleepSeconds !== undefined) await insert('sleep_rem_seconds', s.remSleepSeconds, 's', s.calendarDate)
    }

    // HRV summary
    if (evt.hrv) {
      const h = evt.hrv
      if (h.rmssd !== undefined) await insert('hrv_rmssd', h.rmssd, 'ms', h.calendarDate)
    }

    // Stress summary
    if (evt.stress) {
      const st = evt.stress
      if (st.stressScore !== undefined) await insert('stress_score', st.stressScore, 'score', st.calendarDate)
    }

    // Respiration epoch rate (per minute)
    if (evt.respirationEpoch) {
      const r = evt.respirationEpoch
      if (r.respirationRate !== undefined) await insert('respiration_rate', r.respirationRate, 'rpm', r.startTimeInSeconds)
    }
  }

  return new NextResponse('ok', { status: 200 })
} 