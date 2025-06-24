/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { RiHeartLine } from '@remixicon/react'

export default async function HRVWidget() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Find Garmin connection
  const { data: conn } = await (supabase as any)
    .from('wearable_connections')
    .select('id')
    .eq('user_id', user.id)
    .eq('wearable_type', 'garmin')
    .maybeSingle()

  if (!conn) {
    return (
      <Card className="bg-card border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <RiHeartLine size={20} />
            Heart Rate Variability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No Garmin connection found.</p>
        </CardContent>
      </Card>
    )
  }

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.toISOString()
  const todayEnd = new Date(today.getTime() + 86400000).toISOString()

  // Get last 7 days for rolling average
  const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000)
  const sevenDaysStart = sevenDaysAgo.toISOString()

  // Fetch today's HRV
  const { data: todayHRV } = await (supabase as any)
    .from('wearable_data')
    .select('value, timestamp')
    .eq('connection_id', conn.id)
    .eq('metric_type', 'hrv_rmssd')
    .gte('timestamp', todayStart)
    .lt('timestamp', todayEnd)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch last 7 days of HRV data
  const { data: weekHRV } = await (supabase as any)
    .from('wearable_data')
    .select('value, timestamp')
    .eq('connection_id', conn.id)
    .eq('metric_type', 'hrv_rmssd')
    .gte('timestamp', sevenDaysStart)
    .lt('timestamp', todayEnd)
    .order('timestamp', { ascending: false })

  // Calculate 7-day rolling average
  let sevenDayAverage: number | null = null
  if (weekHRV && weekHRV.length > 0) {
    // Group by day and get daily averages
    const dailyAverages = new Map<string, number[]>()
    
    weekHRV.forEach((row: any) => {
      const date = new Date(row.timestamp).toISOString().split('T')[0]
      if (!dailyAverages.has(date)) {
        dailyAverages.set(date, [])
      }
      dailyAverages.get(date)!.push(Number(row.value))
    })

    // Calculate average for each day
    const dailyHRVs: number[] = []
    dailyAverages.forEach((values) => {
      const dayAverage = values.reduce((sum, val) => sum + val, 0) / values.length
      dailyHRVs.push(dayAverage)
    })

    // Calculate 7-day rolling average
    if (dailyHRVs.length > 0) {
      sevenDayAverage = dailyHRVs.reduce((sum, val) => sum + val, 0) / dailyHRVs.length
    }
  }

  const todayHRVValue = todayHRV ? Number(todayHRV.value) : null
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
          <RiHeartLine size={20} />
          Heart Rate Variability
        </CardTitle>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's HRV */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">
              {todayHRVValue ? `${todayHRVValue.toFixed(0)} ms` : 'No data'}
            </span>
            <span className="text-sm text-muted-foreground">today</span>
          </div>
        </div>

        {/* 7-day average */}
        {sevenDayAverage && (
          <div className="flex flex-col pt-2 border-t">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-medium text-muted-foreground">
                {sevenDayAverage.toFixed(0)} ms
              </span>
              <span className="text-sm text-muted-foreground">7-day average</span>
            </div>
            {todayHRVValue && (
              <div className="mt-1">
                {todayHRVValue > sevenDayAverage ? (
                  <span className="text-xs text-green-600 font-medium">
                    +{(todayHRVValue - sevenDayAverage).toFixed(0)} ms above average
                  </span>
                ) : todayHRVValue < sevenDayAverage ? (
                  <span className="text-xs text-orange-600 font-medium">
                    -{(sevenDayAverage - todayHRVValue).toFixed(0)} ms below average
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground font-medium">
                    At average
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {!todayHRVValue && !sevenDayAverage && (
          <p className="text-sm text-muted-foreground">
            No HRV data available yet. Data will appear once your Garmin device syncs.
          </p>
        )}
      </CardContent>
    </Card>
  )
} 