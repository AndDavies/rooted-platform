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

function verifyOAuth1(req: NextRequest, consumerSecret: string): boolean {
  const authHeader = req.headers.get('authorization') || ''
  const params = parseOAuthHeader(authHeader)
  if (!params.oauth_signature) return false

  const baseString = buildBaseString(req, params)
  const computed = crypto
    .createHmac('sha1', `${consumerSecret}&`)
    .update(baseString)
    .digest('base64')

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(params.oauth_signature))
}

export async function POST(request: NextRequest) {
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

    // Example for dailySummary payload containing steps
    if (evt.dailies?.steps) {
      await (supabaseAdmin as any).from('wearable_data').insert({
        connection_id: conn.id,
        metric_type: 'steps',
        value: evt.dailies.steps,
        unit: 'steps',
        timestamp: evt.dailies.startTimeInSeconds
          ? new Date(evt.dailies.startTimeInSeconds * 1000).toISOString()
          : new Date().toISOString(),
        source: 'garmin',
      })
    }

    // Add more mappings as needed
  }

  return new NextResponse('ok', { status: 200 })
} 