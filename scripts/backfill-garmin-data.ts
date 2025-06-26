#!/usr/bin/env tsx
/**
 * Backfill script to process historical raw Garmin webhook data
 * 
 * Usage:
 *   npx tsx scripts/backfill-garmin-data.ts [--dry-run] [--batch-size=50] [--start-date=2024-01-01]
 */

import { supabaseAdmin } from '../utils/supabase/admin'

interface BackfillOptions {
  dryRun: boolean
  batchSize: number
  startDate?: string
  endDate?: string
}

// Extract the parsing logic from the webhook for reuse
async function getConnectionId(garminUserId: string, connCache: Record<string, string | undefined>): Promise<string | undefined> {
  if (connCache[garminUserId] !== undefined) return connCache[garminUserId]

  const { data, error } = await (supabaseAdmin as any)
    .from('wearable_connections')
    .select('id')
    .eq('wearable_user_id', garminUserId)
    .eq('wearable_type', 'garmin')
    .maybeSingle()

  if (error) {
    console.error(`[Backfill] Failed to get connection for user ${garminUserId}:`, error)
    return undefined
  }

  connCache[garminUserId] = data?.id
  return data?.id
}

async function insertMetric(
  connId: string,
  metric: string,
  value: number,
  unit: string | null,
  ts: string | number,
  dryRun: boolean = false
): Promise<boolean> {
  try {
    const timestamp = typeof ts === 'number' ? new Date(ts * 1000).toISOString() : new Date(ts).toISOString()
    
    if (dryRun) {
      console.log(`[Backfill] DRY RUN: Would insert ${metric}=${value}${unit ? ` ${unit}` : ''} at ${timestamp}`)
      return true
    }

    const { error } = await (supabaseAdmin as any).from('wearable_data').upsert({
      connection_id: connId,
      metric_type: metric,
      value,
      unit,
      timestamp,
      source: 'garmin',
    }, { 
      onConflict: 'connection_id,metric_type,timestamp',
      ignoreDuplicates: false 
    })

    if (error) {
      console.error(`[Backfill] Failed to insert metric ${metric}=${value} for connection ${connId}:`, error)
      return false
    }

    console.log(`[Backfill] ✓ Inserted ${metric}=${value}${unit ? ` ${unit}` : ''} at ${timestamp}`)
    return true
  } catch (e) {
    console.error(`[Backfill] Exception inserting metric ${metric}:`, e)
    return false
  }
}

async function processRawEvent(rawEvent: any, connCache: Record<string, string | undefined>, dryRun: boolean): Promise<{ total: number, success: number, failed: number }> {
  let totalMetrics = 0
  let successfulInserts = 0
  let failedInserts = 0

  const payload = rawEvent.payload

  // Build event wrappers same as webhook
  const eventWrappers: any[] = payload?.events ?? []

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
    eventWrappers.push(
      ...payload.allDayRespiration.map((r: any) => {
        const breathsObj = r.timeOffsetEpochToBreaths || {}
        const breaths = Object.values(breathsObj).filter((b: any) => typeof b === 'number' && b > 0)
        const avg = breaths.length ? (breaths as number[]).reduce((a, b) => a + (b as number), 0) / breaths.length : undefined
        return { allDayRespiration: { ...r, avgRespirationRate: avg }, userId: r.userId }
      }),
    )
  }

  for (const evt of eventWrappers) {
    const garminUserId = evt.userId
    if (!garminUserId) {
      console.warn('[Backfill] Event missing userId, skipping')
      continue
    }

    const connId = await getConnectionId(garminUserId, connCache)
    if (!connId) {
      console.warn(`[Backfill] No connection found for user ${garminUserId}`)
      continue
    }

    // Process all metrics exactly like webhook - Dailies
    if (evt.dailies) {
      const d = evt.dailies
      const timestamp = d.startTimeInSeconds ?? Date.now() / 1000

      // Activity metrics
      if (d.steps !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'steps', d.steps, 'steps', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.activeKilocalories !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'active_calories', d.activeKilocalories, 'kcal', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.bmrKilocalories !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'bmr_calories', d.bmrKilocalories, 'kcal', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.floorsClimbed !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'floors', d.floorsClimbed, 'floors', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.distanceInMeters !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'distance', d.distanceInMeters, 'm', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }

      // Time metrics
      if (d.durationInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'duration', d.durationInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.activeTimeInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'active_time', d.activeTimeInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }

      // Heart rate metrics
      if (d.maxHeartRateInBeatsPerMinute !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'heart_rate_max', d.maxHeartRateInBeatsPerMinute, 'bpm', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.averageHeartRateInBeatsPerMinute !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'heart_rate_avg', d.averageHeartRateInBeatsPerMinute, 'bpm', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.restingHeartRateInBeatsPerMinute !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'heart_rate_resting', d.restingHeartRateInBeatsPerMinute, 'bpm', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.minHeartRateInBeatsPerMinute !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'heart_rate_min', d.minHeartRateInBeatsPerMinute, 'bpm', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }

      // Stress metrics from dailies
      if (d.maxStressLevel !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'stress_max', d.maxStressLevel, 'score', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.averageStressLevel !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'stress_avg', d.averageStressLevel, 'score', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }

      // Stress duration metrics
      if (d.stressDurationInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'stress_duration', d.stressDurationInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.lowStressDurationInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'stress_low_duration', d.lowStressDurationInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.mediumStressDurationInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'stress_medium_duration', d.mediumStressDurationInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.highStressDurationInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'stress_high_duration', d.highStressDurationInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }

      // Intensity metrics
      if (d.moderateIntensityDurationInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'intensity_moderate_duration', d.moderateIntensityDurationInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (d.vigorousIntensityDurationInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'intensity_vigorous_duration', d.vigorousIntensityDurationInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
    }

    // Wellness Sleep
    if (evt.wellnessSleep) {
      const s = evt.wellnessSleep
      const timestamp = s.calendarDate

      if (s.totalSleepSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'sleep_total_seconds', s.totalSleepSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (s.deepSleepSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'sleep_deep_seconds', s.deepSleepSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (s.remSleepSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'sleep_rem_seconds', s.remSleepSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (s.lightSleepSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'sleep_light_seconds', s.lightSleepSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (s.awakeDurationInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'sleep_awake_seconds', s.awakeDurationInSeconds, 's', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (s.sleepStartTimeInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'sleep_start_time', s.sleepStartTimeInSeconds, 'timestamp', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
      if (s.sleepEndTimeInSeconds !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'sleep_end_time', s.sleepEndTimeInSeconds, 'timestamp', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
    }

    // HRV
    if (evt.hrv) {
      const h = evt.hrv
      if (h.lastNightAvg !== undefined) {
        totalMetrics++
        const timestamp = h.calendarDate ?? h.startTimeInSeconds
        if (await insertMetric(connId, 'hrv_rmssd', h.lastNightAvg, 'ms', timestamp, dryRun)) successfulInserts++; else failedInserts++
      }
    }

    // Stress summary
    if (evt.stress) {
      const st = evt.stress
      if (st.stressScore !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'stress_score', st.stressScore, 'score', st.calendarDate, dryRun)) successfulInserts++; else failedInserts++
      }
    }

    // Respiration epoch
    if (evt.respirationEpoch) {
      const r = evt.respirationEpoch
      if (r.respirationRate !== undefined) {
        totalMetrics++
        if (await insertMetric(connId, 'respiration_rate', r.respirationRate, 'rpm', r.startTimeInSeconds, dryRun)) successfulInserts++; else failedInserts++
      }
    }

    // All-day respiration
    if (evt.allDayRespiration) {
      const r = evt.allDayRespiration
      if (r.avgRespirationRate !== undefined && r.avgRespirationRate > 0) {
        totalMetrics++
        if (await insertMetric(connId, 'respiration_rate', r.avgRespirationRate, 'rpm', r.startTimeInSeconds, dryRun)) successfulInserts++; else failedInserts++
      }
    }
  }

  return { total: totalMetrics, success: successfulInserts, failed: failedInserts }
}

async function backfillGarminData(options: BackfillOptions) {
  console.log('[Backfill] Starting Garmin data backfill...')
  console.log('[Backfill] Options:', options)

  // Build date filter
  let dateFilter = ''
  const params: any[] = []
  
  if (options.startDate) {
    dateFilter += ' AND received_at >= $1'
    params.push(options.startDate)
  }
  
  if (options.endDate) {
    const endIndex = params.length + 1
    dateFilter += ` AND received_at <= $${endIndex}`
    params.push(options.endDate)
  }

  // Get total count first
  let countQuery = (supabaseAdmin as any)
    .from('wearable_event_raw')
    .select('*', { count: 'exact', head: true })

  if (options.startDate) {
    countQuery = countQuery.gte('received_at', options.startDate)
  }
  if (options.endDate) {
    countQuery = countQuery.lt('received_at', options.endDate)
  }

  const { count: totalEvents, error: countError } = await countQuery

  if (countError) {
    console.error('[Backfill] Failed to get event count:', countError)
    return
  }
  console.log(`[Backfill] Found ${totalEvents} raw events to process`)

  if (totalEvents === 0) {
    console.log('[Backfill] No events to process. Exiting.')
    return
  }

  // Process in batches
  let processed = 0
  let totalMetrics = 0
  let totalSuccess = 0
  let totalFailed = 0
  let offset = 0

  const connCache: Record<string, string | undefined> = {}

  while (processed < totalEvents) {
    console.log(`[Backfill] Processing batch ${Math.floor(offset / options.batchSize) + 1}/${Math.ceil(totalEvents / options.batchSize)} (${processed}/${totalEvents})`)

    // Fetch batch of raw events
    const { data: rawEvents, error } = await (supabaseAdmin as any)
      .from('wearable_event_raw')
      .select('id, received_at, payload')
      .gte('received_at', options.startDate || '1970-01-01')
      .lt('received_at', options.endDate || '2099-12-31')
      .order('received_at', { ascending: true })
      .range(offset, offset + options.batchSize - 1)

    if (error) {
      console.error('[Backfill] Failed to fetch raw events:', error)
      break
    }

    if (!rawEvents || rawEvents.length === 0) {
      console.log('[Backfill] No more events to process')
      break
    }

    // Process each event in the batch
    for (const rawEvent of rawEvents) {
      try {
        const result = await processRawEvent(rawEvent, connCache, options.dryRun)
        totalMetrics += result.total
        totalSuccess += result.success
        totalFailed += result.failed
        
        if (result.total > 0) {
          console.log(`[Backfill] Event ${rawEvent.id}: ${result.success}/${result.total} metrics processed`)
        }
      } catch (e) {
        console.error(`[Backfill] Error processing event ${rawEvent.id}:`, e)
      }
    }

    processed += rawEvents.length
    offset += options.batchSize

    // Add a small delay between batches to be gentle on the database
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n[Backfill] ===== SUMMARY =====')
  console.log(`[Backfill] Processed ${processed} raw events`)
  console.log(`[Backfill] Extracted ${totalMetrics} total metrics`)
  console.log(`[Backfill] Successfully inserted: ${totalSuccess}`)
  console.log(`[Backfill] Failed insertions: ${totalFailed}`)
  console.log(`[Backfill] Success rate: ${totalMetrics > 0 ? ((totalSuccess / totalMetrics) * 100).toFixed(1) : 0}%`)
  
  if (options.dryRun) {
    console.log('[Backfill] DRY RUN - No data was actually inserted')
  }
}

// Optional: create indexes for better performance
async function createIndexes() {
  try {
    await (supabaseAdmin as any).rpc('exec_sql', {
      sql: `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wearable_event_raw_received_at 
        ON wearable_event_raw(received_at);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wearable_data_connection_metric_timestamp 
        ON wearable_data(connection_id, metric_type, timestamp);
      `
    })
    console.log('[Backfill] Indexes created/verified for optimal performance')
  } catch (error) {
    console.warn('[Backfill] Could not create indexes (they may already exist):', error)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  const options: BackfillOptions = {
    dryRun: args.includes('--dry-run'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '50'),
    startDate: args.find(arg => arg.startsWith('--start-date='))?.split('=')[1],
    endDate: args.find(arg => arg.startsWith('--end-date='))?.split('=')[1]
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Garmin Data Backfill Script

Usage: npx tsx scripts/backfill-garmin-data.ts [options]

Options:
  --dry-run                    Show what would be processed without actually inserting data
  --batch-size=N              Process N events at a time (default: 50)
  --start-date=YYYY-MM-DD      Only process events from this date onward
  --end-date=YYYY-MM-DD        Only process events up to this date
  --help, -h                   Show this help message

Examples:
  npx tsx scripts/backfill-garmin-data.ts --dry-run
  npx tsx scripts/backfill-garmin-data.ts --start-date=2024-06-01
  npx tsx scripts/backfill-garmin-data.ts --batch-size=25 --start-date=2024-06-01
    `)
    return
  }

  await createIndexes()
  await backfillGarminData(options)
}

if (require.main === module) {
  main().catch(console.error)
} 