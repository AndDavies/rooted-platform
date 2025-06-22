/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { Suspense } from 'react'
import BreathChartToggle from '@/components/insights/BreathChartToggle'
import type { BreathDataPoint } from '@/components/insights/BreathChart'

export default async function BreathAwarenessWidget() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // find garmin connection
  const { data: conn } = await (supabase as any)
    .from('wearable_connections')
    .select('id')
    .eq('user_id', user.id)
    .eq('wearable_type', 'garmin')
    .maybeSingle()

  if (!conn) return null

  // get most recent day available
  const { data: latestRow } = await (supabase as any)
    .from('wearable_data')
    .select('timestamp')
    .eq('connection_id', conn.id)
    .eq('metric_type', 'respiration_rate')
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latestRow) {
    return (
      <Card className="bg-card border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary">
            <Link href="/integrations/breath-awareness" className="hover:underline">
              Breath Awareness
            </Link>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Daily Respiration</p>
          <time className="text-xs text-muted-foreground" dateTime={latestRow?.timestamp}>
            {latestRow?.timestamp ? new Date(latestRow.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No data'}
          </time>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No respiration data yet.</p>
        </CardContent>
      </Card>
    )
  }

  const latestDate = new Date(latestRow.timestamp)
  latestDate.setHours(0, 0, 0, 0)
  const start = latestDate.toISOString()
  const end = new Date(latestDate.getTime() + 86400000).toISOString()

  const { data: dayRows } = await (supabase as any)
    .from('wearable_data')
    .select('timestamp, metric_type, value')
    .eq('connection_id', conn.id)
    .in('metric_type', ['respiration_rate', 'hrv_rmssd', 'steps'])
    .gte('timestamp', start)
    .lt('timestamp', end)
    .order('timestamp')

  const respRows = (dayRows ?? []).filter((r: any) => r.metric_type === 'respiration_rate')
  const hrvRows = (dayRows ?? []).filter((r: any) => r.metric_type === 'hrv_rmssd')

  const chartData: BreathDataPoint[] = respRows.map((r: any) => ({ timestamp: r.timestamp, rate: Number(r.value) }))

  const hrvData = hrvRows.map((r: any) => ({ timestamp: r.timestamp, hrv: Number(r.value) }))

  // Simple mindful session detection: consecutive respiration points within 10-12 bpm for >=5 points (~5min) & daily steps <100/min approx handled by ignoring steps >=100 at same timestamp
  const sessionRanges: { startIdx: number; endIdx: number }[] = []
  let currentStart: number | null = null
  for (let i = 0; i < chartData.length; i++) {
    const rate = chartData[i].rate
    if (rate >= 10 && rate <= 12) {
      if (currentStart === null) currentStart = i
    } else {
      if (currentStart !== null && i - currentStart >= 5) {
        sessionRanges.push({ startIdx: currentStart, endIdx: i - 1 })
      }
      currentStart = null
    }
  }
  if (currentStart !== null && chartData.length - currentStart >= 5) {
    sessionRanges.push({ startIdx: currentStart, endIdx: chartData.length - 1 })
  }

  const sessionCount = sessionRanges.length
  const totalSessionMinutes = sessionRanges.reduce((acc, r) => acc + (r.endIdx - r.startIdx + 1), 0)

  // sleep range indices (based on first & last HRV sample)
  let sleepRange: { startIdx: number; endIdx: number } | null = null
  if (hrvData.length > 0) {
    const firstTs = new Date(hrvData[0].timestamp).getTime()
    const lastTs = new Date(hrvData[hrvData.length - 1].timestamp).getTime()
    const startIdx = chartData.findIndex((d) => new Date(d.timestamp).getTime() >= firstTs)
    const endIdx = chartData.findIndex((d) => new Date(d.timestamp).getTime() > lastTs) - 1
    if (startIdx >= 0 && endIdx >= startIdx) {
      sleepRange = { startIdx, endIdx }
    }
  }

  return (
    <Card className="bg-card border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-primary">
          <Link href="/integrations/breath-awareness" className="hover:underline">
            Breath Awareness
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Daily Respiration</p>
        <time className="text-xs text-muted-foreground" dateTime={latestDate.toISOString()}>
          {latestDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading graph…</p>}>
            <BreathChartToggle
              data={chartData}
              hrvData={hrvData}
              sessionRanges={sessionRanges}
              sleepRange={sleepRange}
              dayLabel={latestDate.toLocaleDateString()}
            />
            {sessionCount > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  {sessionCount} Mindful Sessions, {totalSessionMinutes} min
                </span>
                {hrvData.length > 0 && (
                  <span className="text-xs text-muted-foreground">Avg HRV {( 
                    hrvData.reduce((acc: number, dp: { hrv: number }) => acc + dp.hrv, 0) / hrvData.length
                  ).toFixed(0)} ms</span>
                )}
              </div>
            )}
          </Suspense>
        ) : (
          <p className="text-sm text-muted-foreground">No respiration data for selected day.</p>
        )}
      </CardContent>
    </Card>
  )
} 