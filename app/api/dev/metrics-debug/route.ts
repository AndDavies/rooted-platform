import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const days = parseInt(url.searchParams.get('days') || '7')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 })
    }

    // Get connection for user
    const { data: connection, error: connError } = await (supabaseAdmin as any)
      .from('wearable_connections')
      .select('id, wearable_user_id, created_at')
      .eq('wearable_user_id', userId)
      .eq('wearable_type', 'garmin')
      .maybeSingle()

    if (connError || !connection) {
      return NextResponse.json({ 
        error: 'No Garmin connection found for user',
        debug: { userId, connError }
      }, { status: 404 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all metrics for the connection in the last N days
    const { data: metrics, error: metricsError } = await (supabaseAdmin as any)
      .from('wearable_data')
      .select('metric_type, value, unit, timestamp, created_at')
      .eq('connection_id', connection.id)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    if (metricsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch metrics',
        debug: { metricsError }
      }, { status: 500 })
    }

    // Get raw events for comparison
    const { data: rawEvents, error: rawError } = await (supabaseAdmin as any)
      .from('wearable_event_raw')
      .select('id, received_at, payload')
      .gte('received_at', startDate.toISOString())
      .order('received_at', { ascending: false })
      .limit(10)

    if (rawError) {
      console.warn('Failed to fetch raw events:', rawError)
    }

    // Analyze metrics by type
    const metricsByType = metrics.reduce((acc: any, metric: any) => {
      if (!acc[metric.metric_type]) {
        acc[metric.metric_type] = {
          count: 0,
          latest: null,
          earliest: null,
          values: [],
          unit: metric.unit
        }
      }
      acc[metric.metric_type].count++
      acc[metric.metric_type].values.push({
        value: metric.value,
        timestamp: metric.timestamp
      })
      
      if (!acc[metric.metric_type].latest || metric.timestamp > acc[metric.metric_type].latest) {
        acc[metric.metric_type].latest = metric.timestamp
      }
      if (!acc[metric.metric_type].earliest || metric.timestamp < acc[metric.metric_type].earliest) {
        acc[metric.metric_type].earliest = metric.timestamp
      }
      
      return acc
    }, {})

    // Expected metric types that should be present
    const expectedMetrics = [
      // Activity metrics
      'steps', 'active_calories', 'bmr_calories', 'floors', 'distance',
      'duration', 'active_time',
      
      // Heart rate metrics
      'heart_rate_max', 'heart_rate_avg', 'heart_rate_resting', 'heart_rate_min',
      
      // Sleep metrics
      'sleep_total_seconds', 'sleep_deep_seconds', 'sleep_rem_seconds', 
      'sleep_light_seconds', 'sleep_awake_seconds',
      
      // Stress metrics
      'stress_score', 'stress_max', 'stress_avg', 'stress_duration',
      'stress_low_duration', 'stress_medium_duration', 'stress_high_duration',
      
      // HRV & Respiration
      'hrv_rmssd', 'respiration_rate',
      
      // Intensity metrics
      'intensity_moderate_duration', 'intensity_vigorous_duration'
    ]

    const missingMetrics = expectedMetrics.filter(metric => !metricsByType[metric])

    // Analyze raw events for potential data
    const rawEventAnalysis = rawEvents?.map((event: any) => {
      const payload = event.payload
      return {
        id: event.id,
        received_at: event.received_at,
        has_dailies: Array.isArray(payload?.dailies) && payload.dailies.length > 0,
        has_wellnessSleep: Array.isArray(payload?.wellnessSleep) && payload.wellnessSleep.length > 0,
        has_hrv: Array.isArray(payload?.hrv) && payload.hrv.length > 0,
        has_stress: Array.isArray(payload?.stress) && payload.stress.length > 0,
        has_respiration: Array.isArray(payload?.respirationEpoch) && payload.respirationEpoch.length > 0,
        has_allDayRespiration: Array.isArray(payload?.allDayRespiration) && payload.allDayRespiration.length > 0,
        payload_keys: Object.keys(payload || {})
      }
    }) || []

    return NextResponse.json({
      debug_info: {
        user_id: userId,
        connection: {
          id: connection.id,
          garmin_user_id: connection.wearable_user_id,
          created_at: connection.created_at
        },
        date_range: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
          days
        }
      },
      metrics_summary: {
        total_records: metrics.length,
        unique_metric_types: Object.keys(metricsByType).length,
        metrics_by_type: metricsByType,
        missing_expected_metrics: missingMetrics
      },
      raw_events_analysis: rawEventAnalysis,
      recommendations: [
        missingMetrics.length > 0 && "Missing expected metrics - check webhook processing",
        rawEventAnalysis.some((e: any) => e.has_wellnessSleep) && !metricsByType['sleep_total_seconds'] && "Sleep data in raw events but not processed",
        rawEventAnalysis.some((e: any) => e.has_stress) && !metricsByType['stress_score'] && "Stress data in raw events but not processed",
        !rawEventAnalysis.some((e: any) => e.has_dailies) && "No dailies data found in recent raw events",
      ].filter(Boolean)
    })

  } catch (error) {
    console.error('[Debug] Error in metrics debug:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      debug: { error: error instanceof Error ? error.message : String(error) }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId } = await request.json()
    
    if (action === 'reprocess_recent') {
      // This would trigger reprocessing of recent raw events
      // For now, just return info about what would be reprocessed
      
      const { data: recentEvents, error } = await (supabaseAdmin as any)
        .from('wearable_event_raw')
        .select('id, received_at, payload')
        .gte('received_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('received_at', { ascending: false })
        .limit(50)

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch recent events' }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Reprocessing simulation',
        events_to_reprocess: recentEvents.length,
        events: recentEvents.map((e: any) => ({
          id: e.id,
          received_at: e.received_at,
          has_data: {
            dailies: Array.isArray(e.payload?.dailies) && e.payload.dailies.length > 0,
            wellnessSleep: Array.isArray(e.payload?.wellnessSleep) && e.payload.wellnessSleep.length > 0,
            hrv: Array.isArray(e.payload?.hrv) && e.payload.hrv.length > 0,
            stress: Array.isArray(e.payload?.stress) && e.payload.stress.length > 0,
          }
        }))
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (error) {
    console.error('[Debug] Error in metrics debug POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      debug: { error: error instanceof Error ? error.message : String(error) }
    }, { status: 500 })
  }
} 