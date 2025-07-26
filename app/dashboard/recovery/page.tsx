'use client'

import { useState, useEffect } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RiHeartPulseLine, RiArrowUpLine, RiArrowDownLine, RiSubtractLine } from "@remixicon/react"
import { createClient } from "@/utils/supabase/client"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Types for our recovery data
interface RecoveryMetric {
  metric_type: string
  value: number
  timestamp: string
}

interface RecoveryData {
  today: {
    hrv?: number
    rhr?: number
    totalSleep?: number
    stress?: number
  }
  sevenDayAvg: {
    hrv?: number
    rhr?: number
    totalSleep?: number
    stress?: number
  }
  trends: {
    hrv: { change: number; status: string }
    rhr: { change: number; status: string }
    totalSleep: { change: number; status: string }
    stress: { change: number; status: string }
  }
  timeSeries: Array<{
    date: string
    hrv?: number
    rhr?: number
    sleep?: number
  }>
}

function TrendIcon({ change, status }: { change: number; status: string }) {
  if (status === 'improving') {
    return <RiArrowUpLine className="h-4 w-4 text-emerald-green" />
  } else if (status === 'declining') {
    return <RiArrowDownLine className="h-4 w-4 text-dark-pastel-red" />
  }
  return <RiSubtractLine className="h-4 w-4 text-misty-sage" />
}

function TrendBadge({ status }: { status: string }) {
  const variants = {
    improving: 'bg-emerald-green/10 text-emerald-green border-emerald-green/20',
    declining: 'bg-dark-pastel-red/10 text-dark-pastel-red border-dark-pastel-red/20',
    stable: 'bg-misty-sage/10 text-misty-sage border-misty-sage/20'
  }
  
  return (
    <Badge variant="outline" className={variants[status as keyof typeof variants]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function calculateTrend(current: number | undefined, previous: number | undefined): { change: number; status: string } {
  if (!current || !previous) return { change: 0, status: 'stable' }
  
  const change = ((current - previous) / previous) * 100
  let status = 'stable'
  
  if (Math.abs(change) > 2) {
    status = change > 0 ? 'improving' : 'declining'
  }
  
  return { change: Math.round(change), status }
}

export default function RecoveryPage() {
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiInsight, setAiInsight] = useState<string>("")
  const [isLoadingInsight, setIsLoadingInsight] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("7d")

  const loadRecoveryData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      // Get user's connection ID (replace with actual user ID)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get user's wearable connection
      const { data: connection, error: connError } = await supabase
        .from('wearable_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('wearable_type', 'garmin')
        .maybeSingle()

      if (connError || !connection) {
        throw new Error('No wearable device connected')
      }

      const connectionId = connection.id

      // Calculate date ranges
      const today = new Date()
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

      // Get recent metrics (last 14 days)
      const { data: metrics, error: metricsError } = await supabase
        .from('wearable_data')
        .select('metric_type, value, timestamp')
        .eq('connection_id', connectionId)
        .in('metric_type', ['hrv_rmssd', 'heart_rate_resting', 'sleep_total_seconds', 'stress_avg'])
        .gte('timestamp', fourteenDaysAgo.toISOString())
        .order('timestamp', { ascending: true })

      if (metricsError) {
        throw new Error('Failed to fetch recovery metrics')
      }

      // Process the data
      const processedData = processRecoveryMetrics(metrics || [], today, sevenDaysAgo)
      setRecoveryData(processedData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recovery data')
    } finally {
      setIsLoading(false)
    }
  }

  const processRecoveryMetrics = (metrics: RecoveryMetric[], today: Date, sevenDaysAgo: Date): RecoveryData => {
    // Group metrics by type and calculate averages
    const metricsByType = metrics.reduce((acc, metric) => {
      const type = metric.metric_type
      if (!acc[type]) acc[type] = []
      acc[type].push(metric)
      return acc
    }, {} as Record<string, RecoveryMetric[]>)

    // Calculate today's values (most recent for each metric)
    const todayValues = {
      hrv: getLatestValue(metricsByType['hrv_rmssd']),
      rhr: getLatestValue(metricsByType['heart_rate_resting']),
      totalSleep: getLatestValue(metricsByType['sleep_total_seconds']) ? 
        Math.round((getLatestValue(metricsByType['sleep_total_seconds'])! / 3600) * 10) / 10 : undefined,
      stress: getLatestValue(metricsByType['stress_avg'])
    }

    // Calculate 7-day averages
    const sevenDayValues = {
      hrv: calculatePeriodAverage(metricsByType['hrv_rmssd'], sevenDaysAgo),
      rhr: calculatePeriodAverage(metricsByType['heart_rate_resting'], sevenDaysAgo),
      totalSleep: calculatePeriodAverage(metricsByType['sleep_total_seconds'], sevenDaysAgo, true),
      stress: calculatePeriodAverage(metricsByType['stress_avg'], sevenDaysAgo)
    }

    // Calculate 7-14 day averages for comparison
    const previousWeekStart = new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
    const previousWeekValues = {
      hrv: calculatePeriodAverage(metricsByType['hrv_rmssd'], previousWeekStart, false, sevenDaysAgo),
      rhr: calculatePeriodAverage(metricsByType['heart_rate_resting'], previousWeekStart, false, sevenDaysAgo),
      totalSleep: calculatePeriodAverage(metricsByType['sleep_total_seconds'], previousWeekStart, true, sevenDaysAgo),
      stress: calculatePeriodAverage(metricsByType['stress_avg'], previousWeekStart, false, sevenDaysAgo)
    }

    // Calculate trends
    const trends = {
      hrv: calculateTrend(sevenDayValues.hrv, previousWeekValues.hrv),
      rhr: calculateTrend(previousWeekValues.rhr, sevenDayValues.rhr), // Lower RHR is better
      totalSleep: calculateTrend(sevenDayValues.totalSleep, previousWeekValues.totalSleep),
      stress: calculateTrend(previousWeekValues.stress, sevenDayValues.stress) // Lower stress is better
    }

    // Create time series data for the last 7 days
    const timeSeries = createTimeSeries(metricsByType, sevenDaysAgo)

    return {
      today: todayValues,
      sevenDayAvg: sevenDayValues,
      trends,
      timeSeries
    }
  }

  const getLatestValue = (metrics: RecoveryMetric[] = []): number | undefined => {
    if (metrics.length === 0) return undefined
    return metrics[metrics.length - 1]?.value
  }

  const calculatePeriodAverage = (
    metrics: RecoveryMetric[] = [], 
    startDate: Date, 
    convertHours = false,
    endDate?: Date
  ): number | undefined => {
    const filteredMetrics = metrics.filter(m => {
      const metricDate = new Date(m.timestamp)
      if (endDate) {
        return metricDate >= startDate && metricDate < endDate
      }
      return metricDate >= startDate
    })

    if (filteredMetrics.length === 0) return undefined

    const sum = filteredMetrics.reduce((acc, m) => acc + m.value, 0)
    const average = sum / filteredMetrics.length

    return convertHours ? Math.round((average / 3600) * 10) / 10 : Math.round(average * 10) / 10
  }

  const createTimeSeries = (metricsByType: Record<string, RecoveryMetric[]>, startDate: Date) => {
    // Create daily buckets for the last 7 days
    const timeSeries = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      timeSeries.push({
        date: dateStr,
        hrv: getDayValue(metricsByType['hrv_rmssd'], date),
        rhr: getDayValue(metricsByType['heart_rate_resting'], date),
        sleep: getDayValue(metricsByType['sleep_total_seconds'], date, true)
      })
    }
    return timeSeries
  }

  const getDayValue = (metrics: RecoveryMetric[] = [], targetDate: Date, convertHours = false): number | undefined => {
    const dayStart = new Date(targetDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(targetDate)
    dayEnd.setHours(23, 59, 59, 999)

    const dayMetrics = metrics.filter(m => {
      const metricDate = new Date(m.timestamp)
      return metricDate >= dayStart && metricDate <= dayEnd
    })

    if (dayMetrics.length === 0) return undefined

    const average = dayMetrics.reduce((acc, m) => acc + m.value, 0) / dayMetrics.length
    return convertHours ? Math.round((average / 3600) * 10) / 10 : Math.round(average * 10) / 10
  }

  const loadAIInsight = async () => {
    setIsLoadingInsight(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Give me a comprehensive recovery assessment',
        })
      })
      
      const data = await response.json()
      setAiInsight(data.response || "Recovery analysis not available at this time.")
    } catch (error) {
      console.error('Failed to load AI insight:', error)
      setAiInsight("Unable to load recovery analysis. Please try again later.")
    } finally {
      setIsLoadingInsight(false)
    }
  }

  useEffect(() => {
    loadRecoveryData()
    loadAIInsight()
  }, [])

  if (isLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="-ms-4" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    <RiHeartPulseLine size={22} aria-hidden="true" />
                    <span className="sr-only">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Recovery</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your recovery data...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="-ms-4" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    <RiHeartPulseLine size={22} aria-hidden="true" />
                    <span className="sr-only">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Recovery</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Unable to Load Recovery Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadRecoveryData} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (!recoveryData) {
    return <div>No recovery data available</div>
  }

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger className="-ms-4" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  <RiHeartPulseLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Recovery</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8 px-6">
        {/* Page Header with Introductory Text */}
        <div>
          <h1 className="text-2xl font-semibold mb-3">Recovery Dashboard</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 leading-relaxed">
              This dashboard gives you a personalized look at how your body is recovering. Based on HRV, resting heart rate, sleep, and stress data, you'll see how your nervous system and recovery capacity are trending over time. These insights help you understand how your habits, stress levels, and recovery routines are truly affecting your resilience — and how to adjust accordingly.
            </p>
          </div>
        </div>

        {/* Recovery Snapshot Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recovery Snapshot</CardTitle>
            <CardDescription>Today's metrics vs. 7-day average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* HRV */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">HRV</span>
                  <TrendIcon change={recoveryData.trends.hrv.change} status={recoveryData.trends.hrv.status} />
                </div>
                <div className="text-2xl font-bold">
                  {recoveryData.today.hrv ? `${recoveryData.today.hrv}ms` : '--'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    7d avg: {recoveryData.sevenDayAvg.hrv ? `${recoveryData.sevenDayAvg.hrv}ms` : '--'}
                  </span>
                  {recoveryData.trends.hrv.change !== 0 && (
                    <span className={`text-xs ${recoveryData.trends.hrv.status === 'improving' ? 'text-emerald-green' : 'text-dark-pastel-red'}`}>
                      {recoveryData.trends.hrv.change > 0 ? '+' : ''}{recoveryData.trends.hrv.change}%
                    </span>
                  )}
                </div>
                <TrendBadge status={recoveryData.trends.hrv.status} />
              </div>

              {/* Resting HR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resting HR</span>
                  <TrendIcon change={recoveryData.trends.rhr.change} status={recoveryData.trends.rhr.status} />
                </div>
                <div className="text-2xl font-bold">
                  {recoveryData.today.rhr ? `${recoveryData.today.rhr} bpm` : '--'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    7d avg: {recoveryData.sevenDayAvg.rhr ? `${recoveryData.sevenDayAvg.rhr} bpm` : '--'}
                  </span>
                  {recoveryData.trends.rhr.change !== 0 && (
                    <span className={`text-xs ${recoveryData.trends.rhr.status === 'improving' ? 'text-emerald-green' : 'text-dark-pastel-red'}`}>
                      {recoveryData.trends.rhr.change > 0 ? '+' : ''}{recoveryData.trends.rhr.change}%
                    </span>
                  )}
                </div>
                <TrendBadge status={recoveryData.trends.rhr.status} />
              </div>

              {/* Total Sleep */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Sleep</span>
                  <TrendIcon change={recoveryData.trends.totalSleep.change} status={recoveryData.trends.totalSleep.status} />
                </div>
                <div className="text-2xl font-bold">
                  {recoveryData.today.totalSleep ? `${recoveryData.today.totalSleep}h` : '--'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    7d avg: {recoveryData.sevenDayAvg.totalSleep ? `${recoveryData.sevenDayAvg.totalSleep}h` : '--'}
                  </span>
                  {recoveryData.trends.totalSleep.change !== 0 && (
                    <span className={`text-xs ${recoveryData.trends.totalSleep.status === 'improving' ? 'text-emerald-green' : 'text-dark-pastel-red'}`}>
                      {recoveryData.trends.totalSleep.change > 0 ? '+' : ''}{recoveryData.trends.totalSleep.change}%
                    </span>
                  )}
                </div>
                <TrendBadge status={recoveryData.trends.totalSleep.status} />
              </div>

              {/* Stress Average */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stress Average</span>
                  <TrendIcon change={recoveryData.trends.stress.change} status={recoveryData.trends.stress.status} />
                </div>
                <div className="text-2xl font-bold">
                  {recoveryData.today.stress ? `${recoveryData.today.stress}/100` : '--'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    7d avg: {recoveryData.sevenDayAvg.stress ? `${recoveryData.sevenDayAvg.stress}/100` : '--'}
                  </span>
                  {recoveryData.trends.stress.change !== 0 && (
                    <span className={`text-xs ${recoveryData.trends.stress.status === 'improving' ? 'text-emerald-green' : 'text-dark-pastel-red'}`}>
                      {recoveryData.trends.stress.change > 0 ? '+' : ''}{recoveryData.trends.stress.change}%
                    </span>
                  )}
                </div>
                <TrendBadge status={recoveryData.trends.stress.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Trend Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recovery Patterns Over Time</CardTitle>
                <CardDescription>Track your recovery metrics over time</CardDescription>
              </div>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button 
                  variant={selectedPeriod === "7d" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod("7d")}
                >
                  7d
                </Button>
                <Button 
                  variant={selectedPeriod === "14d" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod("14d")}
                >
                  14d
                </Button>
                <Button 
                  variant={selectedPeriod === "30d" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod("30d")}
                >
                  30d
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Time series data display */}
              <div className="grid gap-3">
                {recoveryData.timeSeries.map((day, index) => (
                  <div key={day.date} className="border border-border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                        <span className="text-sm font-semibold text-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex gap-6 text-sm">
                        {day.hrv && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">HRV</div>
                            <div className="font-semibold text-purple-700">{day.hrv}ms</div>
                          </div>
                        )}
                        {day.rhr && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">RHR</div>
<div className="font-semibold text-dark-pastel-red">{day.rhr} bpm</div>
                          </div>
                        )}
                        {day.sleep && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sleep</div>
                            <div className="font-semibold text-blue-700">{day.sleep}h</div>
                          </div>
                        )}
                        {!day.hrv && !day.rhr && !day.sleep && (
                          <div className="text-muted-foreground italic text-sm">No data available</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Data Legend */}
              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
<h4 className="text-sm font-medium text-foreground mb-3">Metric Guide</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-700 rounded-full"></div>
                    <span className="text-foreground"><strong>HRV:</strong> Heart Rate Variability - Higher values indicate better recovery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-foreground"><strong>RHR:</strong> Resting Heart Rate - Lower values indicate better fitness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
                    <span className="text-foreground"><strong>Sleep:</strong> Total sleep duration - 7-9 hours recommended</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Recovery Summary */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Recovery Summary</CardTitle>
            <CardDescription>Personalized insights based on your biometric trends</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInsight ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary"></div>
                <span className="text-sm text-muted-foreground">Analyzing your recovery data...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-strong:text-foreground prose-strong:font-semibold prose-ul:my-2 prose-li:my-1 prose-p:my-2 prose-p:leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-lg font-semibold text-foreground mb-2 mt-3 first:mt-0">{children}</h1>,
h2: ({children}) => <h2 className="text-base font-semibold text-foreground mb-2 mt-3 first:mt-0">{children}</h2>,
h3: ({children}) => <h3 className="text-sm font-semibold text-foreground mb-1 mt-2 first:mt-0">{children}</h3>,
                    p: ({children}) => <p className="text-sm leading-relaxed text-muted-foreground mb-2 last:mb-0">{children}</p>,
                    ul: ({children}) => <ul className="text-sm list-disc list-inside space-y-1 mb-2 text-muted-foreground">{children}</ul>,
                    ol: ({children}) => <ol className="text-sm list-decimal list-inside space-y-1 mb-2 text-muted-foreground">{children}</ol>,
                    li: ({children}) => <li className="text-sm text-muted-foreground">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
em: ({children}) => <em className="italic text-muted-foreground">{children}</em>,
code: ({children}) => <code className="bg-muted text-foreground px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
blockquote: ({children}) => <blockquote className="border-l-4 border-border pl-3 italic text-muted-foreground my-2">{children}</blockquote>
                  }}
                                  >
                    {(aiInsight || "Your recovery data is being analyzed. Please check back shortly for personalized insights.").replace(/^Final Answer:\s*/, "")}
                  </ReactMarkdown>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={loadAIInsight}
              disabled={isLoadingInsight}
            >
              Refresh Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Coach Review Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Coach Review</CardTitle>
            <CardDescription>Human-in-the-loop coaching insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted border border-border rounded-lg p-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <RiHeartPulseLine className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">Coach Review Pending</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your assigned coach will review your recovery and make personalized plan adjustments here. Check back later for expert insights and recommendations.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Request Coach Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Section: Plan vs. Response */}
        <Card>
          <CardHeader>
            <CardTitle>Recovery vs. Your Plan</CardTitle>
            <CardDescription>Coming soon: Plan effectiveness analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                  <RiArrowUpLine className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-medium">Plan vs. Response Analysis</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  In the future, this section will show whether your recovery plan is working — by comparing biometric changes with your activity and plan targets.
                </p>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// TODO: Integrate coach feedback system here
// TODO: Add plan comparison logic using planned interventions vs. biometric outcomes  
// TODO: Connect to timeline API for insight-based journaling 