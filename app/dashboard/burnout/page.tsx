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
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  RiAlarmWarningLine, 
  RiHeartPulseLine, 
  RiArrowUpLine, 
  RiArrowDownLine, 
  RiSubtractLine,
  RiRefreshLine,
  RiUserHeartLine
} from "@remixicon/react"
import { createClient } from "@/utils/supabase/client"

// Types for burnout data
interface BurnoutData {
  score: number
  level: "low" | "moderate" | "high"
  summary: string
  contributingMetrics: {
    hrvDrop: number
    deepSleepPct: number
    stressAvg: number
    rhrTrend: number
    stepsTrend: "increasing" | "decreasing" | "stable"
  }
  detailedAssessment: any
}

interface MetricTrendData {
  hrv: { current: number; trend: number; status: string }
  rhr: { current: number; trend: number; status: string }
  deepSleep: { current: number; trend: number; status: string }
  stress: { current: number; trend: number; status: string }
  steps: { current: number; trend: number; status: string }
}

interface SelfCheckData {
  mood: number
  energy: number
  motivation: number
  irritability: number
  sleepQuality: number
  notes: string
}

function TrendIcon({ trend, status }: { trend: number; status: string }) {
  if (status === 'declining') {
    return <RiArrowDownLine className="h-4 w-4 text-red-500" />
  } else if (status === 'improving') {
    return <RiArrowUpLine className="h-4 w-4 text-green-500" />
  }
  return <RiSubtractLine className="h-4 w-4 text-gray-500" />
}

function RiskLevelBadge({ level }: { level: "low" | "moderate" | "high" }) {
  const variants = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    high: 'bg-red-100 text-red-800 border-red-200'
  }
  
  const icons = {
    low: '🔵',
    moderate: '🟡',
    high: '🔴'
  }
  
  return (
    <Badge variant="outline" className={`${variants[level]} text-sm px-3 py-1`}>
      {icons[level]} {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </Badge>
  )
}

function MetricCard({ 
  title, 
  current, 
  unit, 
  trend, 
  status, 
  icon: Icon 
}: { 
  title: string
  current: number
  unit: string
  trend: number
  status: string
  icon: any 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {current > 0 ? `${current.toFixed(1)}${unit}` : '--'}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <TrendIcon trend={trend} status={status} />
          <span className={`text-xs ${status === 'declining' ? 'text-red-600' : status === 'improving' ? 'text-green-600' : 'text-gray-600'}`}>
            {Math.abs(trend).toFixed(1)}% vs last week
          </span>
        </div>
        <Badge 
          variant="outline" 
          className={`mt-2 ${status === 'declining' ? 'text-red-700 border-red-200' : status === 'improving' ? 'text-green-700 border-green-200' : 'text-gray-700 border-gray-200'}`}
        >
          {status === 'declining' ? '⚠️ Declining' : status === 'improving' ? '✅ Improving' : '➖ Stable'}
        </Badge>
      </CardContent>
    </Card>
  )
}

function EmojiSlider({ 
  label, 
  value, 
  onChange, 
  emojis 
}: { 
  label: string
  value: number
  onChange: (value: number) => void
  emojis: string[]
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index + 1)}
            className={`text-2xl p-2 rounded-lg transition-all ${
              value === index + 1 
                ? 'bg-primary/20 scale-110' 
                : 'hover:bg-gray-100 hover:scale-105'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {value > 0 ? `${value}/5` : 'Select one'}
      </div>
    </div>
  )
}

export default function BurnoutPage() {
  const [burnoutData, setBurnoutData] = useState<BurnoutData | null>(null)
  const [metricTrends, setMetricTrends] = useState<MetricTrendData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Self-check form state
  const [selfCheck, setSelfCheck] = useState<SelfCheckData>({
    mood: 0,
    energy: 0,
    motivation: 0,
    irritability: 0,
    sleepQuality: 0,
    notes: ''
  })
  const [isSavingSelfCheck, setIsSavingSelfCheck] = useState(false)

    const loadBurnoutAssessment = async () => {
    setIsLoadingAssessment(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Use checkBurnoutRisk to analyze my current burnout risk based on recent biometric data. Provide the complete JSON response from the tool.',
        })
      })
      
      const data = await response.json()
      
      // Parse the AI response to extract burnout data from the tool output
      if (data.response) {
        try {
          // Try to find JSON in the response - the tool should return structured data
          const jsonMatch = data.response.match(/\{[\s\S]*?\}(?=\s|$)/)
          if (jsonMatch) {
            const burnoutAssessment = JSON.parse(jsonMatch[0])
            
            // Ensure we have the expected structure
            if (burnoutAssessment.score !== undefined && burnoutAssessment.level && burnoutAssessment.summary) {
              setBurnoutData(burnoutAssessment)
            } else {
              // If the JSON doesn't have the right structure, use the full response as summary
              setBurnoutData({
                score: 3,
                level: "moderate",
                summary: data.response,
                contributingMetrics: {
                  hrvDrop: 0,
                  deepSleepPct: 0,
                  stressAvg: 0,
                  rhrTrend: 0,
                  stepsTrend: "stable"
                },
                detailedAssessment: null
              })
            }
          } else {
            // If no JSON found, create structure from the full AI response
            setBurnoutData({
              score: 3,
              level: "moderate",
              summary: data.response,
              contributingMetrics: {
                hrvDrop: 0,
                deepSleepPct: 0,
                stressAvg: 0,
                rhrTrend: 0,
                stepsTrend: "stable"
              },
              detailedAssessment: null
            })
          }
        } catch (parseError) {
          console.error('Failed to parse burnout assessment:', parseError)
          // Use the AI response as a fallback summary
          setBurnoutData({
            score: 3,
            level: "moderate",
            summary: data.response,
            contributingMetrics: {
              hrvDrop: 0,
              deepSleepPct: 0,
              stressAvg: 0,
              rhrTrend: 0,
              stepsTrend: "stable"
            },
            detailedAssessment: null
          })
        }
      }
    } catch (error) {
      console.error('Failed to load burnout assessment:', error)
      setError('Unable to load burnout assessment')
    } finally {
      setIsLoadingAssessment(false)
    }
  }

  const loadMetricTrends = async () => {
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: connection } = await supabase
        .from('wearable_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('wearable_type', 'garmin')
        .maybeSingle()

      if (!connection) {
        throw new Error('No wearable device connected')
      }

      // Get last 14 days of data for trend calculation
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data: metrics } = await supabase
        .from('wearable_data')
        .select('metric_type, value, timestamp')
        .eq('connection_id', connection.id)
        .in('metric_type', ['hrv_rmssd', 'heart_rate_resting', 'sleep_total_seconds', 'sleep_deep_seconds', 'stress_avg', 'steps'])
        .gte('timestamp', fourteenDaysAgo)
        .order('timestamp', { ascending: true })

      if (metrics) {
        const trends = calculateMetricTrends(metrics)
        setMetricTrends(trends)
      }

    } catch (err) {
      console.error('Failed to load metric trends:', err)
      setError(err instanceof Error ? err.message : 'Failed to load metric trends')
    }
  }

  const calculateMetricTrends = (metrics: any[]): MetricTrendData => {
    const metricsByType = metrics.reduce((acc, metric) => {
      const type = metric.metric_type
      if (!acc[type]) acc[type] = []
      acc[type].push(metric)
      return acc
    }, {} as Record<string, any[]>)

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

    const getMetricTrend = (metricData: any[], isDeepSleep = false) => {
      if (!metricData || metricData.length === 0) {
        return { current: 0, trend: 0, status: 'stable' }
      }

      // Calculate 7-day average (recent week)
      const recent = getAverageForPeriod(metricData, sevenDaysAgo)
      // Calculate 7-14 day average (previous week) 
      const previous = getAverageForPeriod(metricData, fourteenDaysAgo, sevenDaysAgo)
      
      let current = recent
      if (isDeepSleep) {
        // Calculate deep sleep percentage using same methodology as recovery page
        const totalSleepData = metricsByType['sleep_total_seconds'] || []
        const avgTotalSleep = getAverageForPeriod(totalSleepData, sevenDaysAgo)
        current = avgTotalSleep > 0 ? (recent / avgTotalSleep) * 100 : 0
      } else if (metricData === metricsByType['sleep_total_seconds']) {
        // Convert sleep from seconds to hours like recovery page
        current = recent > 0 ? Math.round((recent / 3600) * 10) / 10 : 0
      } else {
        // Round other metrics to 1 decimal place for consistency
        current = recent > 0 ? Math.round(recent * 10) / 10 : 0
      }

      const trend = previous > 0 ? ((recent - previous) / previous) * 100 : 0
      let status = 'stable'
      
      // Use same threshold as recovery page (2% vs 5%)
      if (Math.abs(trend) > 2) {
        // For RHR and stress, decreasing is improving (same logic as recovery page)
        if (metricData === metricsByType['heart_rate_resting'] || metricData === metricsByType['stress_avg']) {
          status = trend < 0 ? 'improving' : 'declining'
        } else {
          status = trend > 0 ? 'improving' : 'declining'
        }
      }

      return { current, trend: Math.abs(trend), status }
    }

    return {
      hrv: getMetricTrend(metricsByType['hrv_rmssd']),
      rhr: getMetricTrend(metricsByType['heart_rate_resting']),
      deepSleep: getMetricTrend(metricsByType['sleep_deep_seconds'], true),
      stress: getMetricTrend(metricsByType['stress_avg']),
      steps: getMetricTrend(metricsByType['steps'])
    }
  }

  const getAverageForPeriod = (metrics: any[], startDate: Date, endDate?: Date): number => {
    const filtered = metrics.filter(m => {
      const metricDate = new Date(m.timestamp)
      if (endDate) {
        return metricDate >= startDate && metricDate < endDate
      }
      return metricDate >= startDate
    })

    if (filtered.length === 0) return 0
    
    const sum = filtered.reduce((acc, m) => acc + m.value, 0)
    const average = sum / filtered.length
    
    // Round to 1 decimal place for consistency with recovery page
    return Math.round(average * 10) / 10
  }

  const saveSelfCheck = async () => {
    // TODO: Wire self-check form to Supabase
    setIsSavingSelfCheck(true)
    try {
      // Placeholder - will implement when burnout_selfcheck_logs table is created
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form after successful save
      setSelfCheck({
        mood: 0,
        energy: 0,
        motivation: 0,
        irritability: 0,
        sleepQuality: 0,
        notes: ''
      })
    } catch (error) {
      console.error('Failed to save self-check:', error)
    } finally {
      setIsSavingSelfCheck(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([
        loadBurnoutAssessment(),
        loadMetricTrends()
      ])
      setIsLoading(false)
    }
    
    loadData()
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
                    <RiAlarmWarningLine size={22} aria-hidden="true" />
                    <span className="sr-only">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Burnout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary mx-auto"></div>
            <p className="text-muted-foreground">Analyzing your burnout risk...</p>
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
                    <RiAlarmWarningLine size={22} aria-hidden="true" />
                    <span className="sr-only">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Burnout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Unable to Load Burnout Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
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
                  <RiAlarmWarningLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Burnout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8 px-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold mb-3">Burnout Dashboard</h1>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900 leading-relaxed">
              Burnout often begins silently. This dashboard analyzes your recovery, sleep, and stress patterns to detect early signs of physical or emotional burnout — so you can take action before it escalates.
            </p>
          </div>
        </div>

        {/* AI Burnout Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <RiAlarmWarningLine className="h-5 w-5" />
                  AI Burnout Assessment
                </CardTitle>
                <CardDescription>AI-powered analysis of your biometric patterns</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadBurnoutAssessment}
                disabled={isLoadingAssessment}
              >
                <RiRefreshLine className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAssessment ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary"></div>
                <span className="text-sm text-muted-foreground">Analyzing your burnout risk...</span>
              </div>
            ) : burnoutData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <RiskLevelBadge level={burnoutData.level} />
                  <span className="text-lg font-semibold">Score: {burnoutData.score}/10</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {burnoutData.summary}
                  </p>
                </div>
                
                {/* Top Contributing Metrics */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-900">Contributing Factors:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                      <div className="font-semibold text-gray-900 mb-1">HRV Drop</div>
                      <div className="text-purple-800 font-medium">{burnoutData.contributingMetrics.hrvDrop.toFixed(1)}%</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="font-semibold text-gray-900 mb-1">Deep Sleep</div>
                      <div className="text-blue-800 font-medium">{burnoutData.contributingMetrics.deepSleepPct.toFixed(1)}%</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <div className="font-semibold text-gray-900 mb-1">Stress Avg</div>
                      <div className="text-red-800 font-medium">{burnoutData.contributingMetrics.stressAvg.toFixed(0)}/100</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <div className="font-semibold text-gray-900 mb-1">RHR Trend</div>
                      <div className="text-orange-800 font-medium">{burnoutData.contributingMetrics.rhrTrend > 0 ? '+' : ''}{burnoutData.contributingMetrics.rhrTrend.toFixed(1)} bpm</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="font-semibold text-gray-900 mb-1">Activity</div>
                      <div className="text-green-800 font-medium capitalize">{burnoutData.contributingMetrics.stepsTrend}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Unable to load burnout assessment. Please try refreshing.</p>
            )}
          </CardContent>
        </Card>

        {/* Metric Trend Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Metric Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {metricTrends ? (
              <>
                <MetricCard
                  title="HRV"
                  current={metricTrends.hrv.current}
                  unit="ms"
                  trend={metricTrends.hrv.trend}
                  status={metricTrends.hrv.status}
                  icon={RiHeartPulseLine}
                />
                <MetricCard
                  title="Resting HR"
                  current={metricTrends.rhr.current}
                  unit=" bpm"
                  trend={metricTrends.rhr.trend}
                  status={metricTrends.rhr.status}
                  icon={RiHeartPulseLine}
                />
                <MetricCard
                  title="Deep Sleep"
                  current={metricTrends.deepSleep.current}
                  unit="%"
                  trend={metricTrends.deepSleep.trend}
                  status={metricTrends.deepSleep.status}
                  icon={RiUserHeartLine}
                />
                <MetricCard
                  title="Stress Avg"
                  current={metricTrends.stress.current}
                  unit="/100"
                  trend={metricTrends.stress.trend}
                  status={metricTrends.stress.status}
                  icon={RiAlarmWarningLine}
                />
                <MetricCard
                  title="Daily Steps"
                  current={metricTrends.steps.current}
                  unit=""
                  trend={metricTrends.steps.trend}
                  status={metricTrends.steps.status}
                  icon={RiUserHeartLine}
                />
              </>
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Burnout Risk Score Panel */}
        {burnoutData && (
          <Card>
            <CardHeader>
              <CardTitle>Burnout Risk Score Breakdown</CardTitle>
              <CardDescription>Detailed scoring based on biometric indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{burnoutData.score}</span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                </div>
                
                <Progress value={(burnoutData.score / 10) * 100} className="h-3" />
                
                                <div className="grid gap-3 mt-4">
                  <div className="text-sm font-semibold text-gray-900">Contributing Factors:</div>
                  {burnoutData.contributingMetrics.hrvDrop > 15 && (
                     <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                       <span className="text-sm font-medium text-gray-900">HRV Drop &gt; 15%</span>
                       <Badge variant="destructive">+3 points</Badge>
                     </div>
                   )}
                   {burnoutData.contributingMetrics.deepSleepPct < 18 && (
                     <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                       <span className="text-sm font-medium text-gray-900">Deep Sleep &lt; 18%</span>
                       <Badge variant="destructive">+2 points</Badge>
                     </div>
                   )}
                   {burnoutData.contributingMetrics.stressAvg > 60 && (
                     <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                       <span className="text-sm font-medium text-gray-900">High Stress Levels</span>
                       <Badge variant="destructive">+2 points</Badge>
                     </div>
                   )}
                   {burnoutData.contributingMetrics.rhrTrend > 3 && (
                     <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                       <span className="text-sm font-medium text-gray-900">RHR Uptrend &gt; 3 bpm</span>
                       <Badge variant="destructive">+2 points</Badge>
                     </div>
                   )}
                   {burnoutData.contributingMetrics.stepsTrend === 'decreasing' && (
                     <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                       <span className="text-sm font-medium text-gray-900">Declining Activity</span>
                       <Badge variant="secondary">+1 point</Badge>
                     </div>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coach Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle>Coach Feedback</CardTitle>
            <CardDescription>Human-in-the-loop coaching insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <RiUserHeartLine className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="font-medium">Coach Feedback (Coming Soon)</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your assigned coach will be able to review your burnout indicators and make personalized adjustments to your wellness plan.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Request Coach Review
                </Button>
              </div>
            </div>
            {/* TODO: Connect coach feedback once user-coach relationship is active */}
          </CardContent>
        </Card>

        {/* Self-Check Prompts */}
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling lately?</CardTitle>
            <CardDescription>Self-reported wellness check to complement your biometric data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <EmojiSlider
                  label="Energy"
                  value={selfCheck.energy}
                  onChange={(value) => setSelfCheck(prev => ({ ...prev, energy: value }))}
                  emojis={['😴', '😑', '😐', '😊', '⚡']}
                />
                
                <EmojiSlider
                  label="Mood"
                  value={selfCheck.mood}
                  onChange={(value) => setSelfCheck(prev => ({ ...prev, mood: value }))}
                  emojis={['😢', '😕', '😐', '😊', '😄']}
                />
                
                <EmojiSlider
                  label="Motivation"
                  value={selfCheck.motivation}
                  onChange={(value) => setSelfCheck(prev => ({ ...prev, motivation: value }))}
                  emojis={['😩', '😑', '😐', '💪', '🔥']}
                />
                
                <EmojiSlider
                  label="Irritability"
                  value={selfCheck.irritability}
                  onChange={(value) => setSelfCheck(prev => ({ ...prev, irritability: value }))}
                  emojis={['😌', '😐', '😤', '😠', '🤬']}
                />
                
                <EmojiSlider
                  label="Sleep Quality"
                  value={selfCheck.sleepQuality}
                  onChange={(value) => setSelfCheck(prev => ({ ...prev, sleepQuality: value }))}
                  emojis={['😵', '😴', '😐', '😊', '🌟']}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="How are you feeling? Any specific concerns or observations..."
                  value={selfCheck.notes}
                  onChange={(e) => setSelfCheck(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={saveSelfCheck}
                disabled={isSavingSelfCheck}
                className="w-full md:w-auto"
              >
                {isSavingSelfCheck ? 'Saving...' : 'Save Self-Check'}
              </Button>
            </div>
            {/* TODO: Wire self-check form to Supabase */}
            {/* TODO: Compare burnout score to weekly plan once plan structure is finalized */}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
