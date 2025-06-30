'use client'

import { useState } from "react"
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
import { 
  RiAlarmWarningLine, 
  RiHeartPulseLine, 
  RiFlagLine,
  RiRobotLine,
  RiCheckboxCircleLine,
  RiBrainLine,
  RiMoonLine,
  RiSpeedLine,
  RiRunLine,
  RiLeafLine,
  RiEmotionLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiLineChartLine,
  RiBarChartLine,
  RiStarLine,
  RiSparklingLine,
  RiFlashlightLine,
  RiCheckLine,
  RiTimeLine,
  RiCloseLine
} from "@remixicon/react"

// Mock Data - Aligned with burnout scenario
const burnoutData = {
  userGoal: "Complete 7 consecutive days of breathwork practice",
  burnoutScore: 6, // out of 10
  riskLevel: "Moderate" as const,
  hrvTrend: -5.2, // % decline
  deepSleepPct: 16.8, // % of sleep
  rhrTrend: +2.4, // bpm increase
  stressScore: 58, // /100
  stepTrend: "Decreasing" as const,
  recoveryScore: 64, // /100
  goalProgress: 45, // % toward user goal
  burnoutHistory: [3, 4, 5, 6, 6], // score over past 5 weeks
  radarMetrics: {
    sleep: 5.2,
    recovery: 4.8,
    stress: 6.9,
    movement: 3.5,
    nutrition: 5.0,
    mindset: 4.0
  },
  // Breathwork streak data
  breathworkStreak: {
    currentStreak: 4,
    targetStreak: 7,
    completedDays: [true, true, false, true, true, true, true] // Last 7 days
  },
  // HRV readings throughout the day (like the screenshot)
  dailyHRVReadings: [
    { time: "6:30 AM", value: 52, status: "good" },
    { time: "9:15 AM", value: 48, status: "moderate" },
    { time: "12:30 PM", value: 45, status: "moderate" },
    { time: "3:45 PM", value: 41, status: "low" },
    { time: "6:20 PM", value: 43, status: "moderate" },
    { time: "9:10 PM", value: 47, status: "good" },
    { time: "11:30 PM", value: 44, status: "moderate" }
  ]
}

// Chart Components
function LineChart({ data, className = "", color = "primary" }: { data: number[]; className?: string; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - (((value - min) / range) * 80 + 10) // 10% margin top/bottom
    return `${x},${y}`
  }).join(' ')

  const colorClasses = {
    primary: "stroke-primary",
    orange: "stroke-orange-500", 
    red: "stroke-red-500",
    green: "stroke-green-500"
  }

  return (
    <div className={`h-16 w-full ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          className={colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}
        />
      </svg>
    </div>
  )
}

function TrendChart({ data, className = "", title, unit, yAxisLabel }: { data: number[]; className?: string; title: string; unit?: string; yAxisLabel?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const current = data[data.length - 1]
  const first = data[0]
  
  // For HRV, decreasing is bad (red), increasing is good (green)
  // For Stress, increasing is bad (red), decreasing is good (green)
  const isStressMetric = title.toLowerCase().includes('stress')
  const isGoodTrend = isStressMetric ? current < first : current > first
  
  // Chart dimensions
  const chartWidth = 320
  const chartHeight = 160
  const marginLeft = 50
  const marginRight = 20
  const marginTop = 20
  const marginBottom = 40
  const plotWidth = chartWidth - marginLeft - marginRight
  const plotHeight = chartHeight - marginTop - marginBottom
  
  // Add padding to data range for better visualization
  const range = max - min || 1
  const padding = range * 0.15
  const chartMin = min - padding
  const chartMax = max + padding
  const chartRange = chartMax - chartMin
  
  // Generate clean y-axis tick values
  const generateTicks = (min: number, max: number, count: number = 5) => {
    const range = max - min
    const rawStep = range / (count - 1)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const normalizedStep = rawStep / magnitude
    const step = magnitude * (normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10)
    
    const ticks = []
    const start = Math.ceil(min / step) * step
    for (let i = 0; i < count + 2; i++) {
      const value = start + i * step
      if (value >= min && value <= max) {
        ticks.push(Math.round(value * 10) / 10)
      }
    }
    return ticks.slice(0, count)
  }
  
  const yTicks = generateTicks(chartMin, chartMax, 5)
  
  // Calculate positions for data points
  const points = data.map((value, index) => {
    const x = marginLeft + (index / (data.length - 1)) * plotWidth
    const y = marginTop + plotHeight - ((value - chartMin) / chartRange) * plotHeight
    return { x, y, value }
  })
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-4">
          <span className="text-2xl font-semibold text-foreground">
            {current}{unit}
          </span>
          <div className="flex items-center gap-1">
            {isGoodTrend ? (
              <RiArrowUpLine className="h-3 w-3 text-green-500" />
            ) : (
              <RiArrowDownLine className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs ${isGoodTrend ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(((current - first) / first) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="relative flex justify-center">
          <svg width={chartWidth + marginLeft + marginRight} height={chartHeight + marginTop + marginBottom} className="border rounded bg-gradient-to-br from-muted/20 to-muted/10">
            {/* Chart background grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-20"/>
              </pattern>
            </defs>
            <rect x={marginLeft} y={marginTop} width={plotWidth} height={plotHeight} fill="url(#grid)" />
            
            {/* Y-axis */}
            <line 
              x1={marginLeft} 
              y1={marginTop} 
              x2={marginLeft} 
              y2={marginTop + plotHeight} 
              stroke="currentColor" 
              strokeWidth="2" 
              className="text-border" 
            />
            
            {/* X-axis */}
            <line 
              x1={marginLeft} 
              y1={marginTop + plotHeight} 
              x2={marginLeft + plotWidth} 
              y2={marginTop + plotHeight} 
              stroke="currentColor" 
              strokeWidth="2" 
              className="text-border" 
            />
            
            {/* Y-axis ticks and labels */}
            {yTicks.map((tickValue, index) => {
              const y = marginTop + plotHeight - ((tickValue - chartMin) / chartRange) * plotHeight
              return (
                <g key={index}>
                  <line 
                    x1={marginLeft - 5} 
                    y1={y} 
                    x2={marginLeft} 
                    y2={y} 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    className="text-border" 
                  />
                  <text 
                    x={marginLeft - 8} 
                    y={y + 3} 
                    textAnchor="end" 
                    className="text-xs fill-muted-foreground font-medium"
                  >
                    {tickValue}
                  </text>
                </g>
              )
            })}
            
            {/* X-axis labels */}
            <text 
              x={marginLeft} 
              y={marginTop + plotHeight + 25} 
              textAnchor="start" 
              className="text-xs fill-muted-foreground font-medium"
            >
              30 days ago
            </text>
            <text 
              x={marginLeft + plotWidth} 
              y={marginTop + plotHeight + 25} 
              textAnchor="end" 
              className="text-xs fill-muted-foreground font-medium"
            >
              Today
            </text>
            
            {/* Data line with gradient */}
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isGoodTrend ? "#22c55e" : "#ef4444"} stopOpacity="0.8"/>
                <stop offset="100%" stopColor={isGoodTrend ? "#16a34a" : "#dc2626"} stopOpacity="0.9"/>
              </linearGradient>
            </defs>
            
            <path
              d={pathData}
              fill="none"
              stroke={`url(#gradient-${title.replace(/\s+/g, '')})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="currentColor"
                className={isGoodTrend ? "text-green-500" : "text-red-500"}
                stroke="white"
                strokeWidth="1"
              />
            ))}
            
            {/* Highlight first and last points */}
            <circle
              cx={points[0].x}
              cy={points[0].y}
              r="4"
              fill="currentColor"
              className="text-blue-500"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              fill="currentColor"
              className={isGoodTrend ? "text-green-600" : "text-red-600"}
              stroke="white"
              strokeWidth="2"
            />
          </svg>
          
          {/* Y-axis label */}
          {yAxisLabel && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground font-medium whitespace-nowrap">
              {yAxisLabel}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressRing({ value, className = "" }: { value: number; className?: string }) {
  const radius = 60
  const strokeWidth = 8
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className={`relative ${className}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}%</span>
      </div>
    </div>
  )
}

function RadarChart({ data, className = "" }: { data: any; className?: string }) {
  return (
    <div className={`h-64 w-64 relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
        <div className="w-48 h-48 border-2 border-blue-200 rounded-full relative">
          <div className="absolute inset-4 border border-blue-100 rounded-full">
            <div className="absolute inset-4 border border-blue-50 rounded-full">
              {/* Data points */}
              {Object.entries(data).map(([key, value], index) => {
                const angle = (index * 60) * (Math.PI / 180)
                const radius = (value as number / 10) * 80 + 20
                const x = Math.cos(angle - Math.PI / 2) * radius
                const y = Math.sin(angle - Math.PI / 2) * radius
                
                return (
                  <div
                    key={key}
                    className="absolute w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1 -translate-y-1"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Labels */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 relative">
          {Object.keys(data).map((key, index) => {
            const angle = (index * 60) * (Math.PI / 180)
            const x = Math.cos(angle - Math.PI / 2) * 120
            const y = Math.sin(angle - Math.PI / 2) * 120
            
            return (
              <div
                key={key}
                className="absolute text-xs font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`
                }}
              >
                {key}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BurnoutMetricCard({ 
  title, 
  value, 
  unit, 
  trend, 
  icon: Icon,
  status
}: { 
  title: string
  value: number | string
  unit?: string
  trend?: number
  icon: any
  status?: 'good' | 'warning' | 'critical'
}) {
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  }

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-2">
          {value}{unit}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <RiArrowUpLine className="h-3 w-3 text-red-500" />
            ) : (
              <RiArrowDownLine className="h-3 w-3 text-green-500" />
            )}
            <span className={`text-xs ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
        {status && (
          <Badge variant="outline" className={`mt-2 ${statusColors[status]}`}>
            {status === 'good' ? '✅ Good' : status === 'warning' ? '⚠️ Monitor' : '🚨 Critical'}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

function RecoveryPrompt({ 
  icon, 
  title, 
  description,
  completed = false
}: { 
  icon: string
  title: string
  description: string
  completed?: boolean
}) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-md ${
      completed ? 'bg-green-50 border-green-200' : 'bg-card border-border hover:border-primary/50'
    }`}>
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <h4 className={`font-medium ${completed ? 'text-green-800 line-through' : 'text-foreground'}`}>
          {title}
        </h4>
        <p className={`text-sm ${completed ? 'text-green-600' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>
      <Button
        variant={completed ? "outline" : "default"}
        size="sm"
        className={completed ? "text-green-600 border-green-300" : ""}
      >
        {completed ? '✓ Done' : 'Start'}
      </Button>
    </div>
  )
}

export default function BurnoutMVPPage() {
  const [completedPrompts, setCompletedPrompts] = useState<Set<number>>(new Set([1]))

  const togglePrompt = (index: number) => {
    const newCompleted = new Set(completedPrompts)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedPrompts(newCompleted)
  }

  return (
    <>
      {/* Breadcrumb */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/burnout">Burnout</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>MVP Demo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Connection Indicators */}
        <div className="flex items-center gap-3 px-3">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <img src="/whoop-logo.png" alt="Whoop" className="h-6 w-auto" />
            <span className="text-xs font-medium text-green-700">Connected</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <img src="/garmin-logo.png" alt="Garmin" className="h-6 w-auto" />
            <span className="text-xs font-medium text-green-700">Connected</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 py-6">
        {/* 1. Hero / Intro Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <RiAlarmWarningLine className="h-8 w-8 text-primary" />
              Your Burnout Risk Overview
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Review your stress, recovery, and burnout signals with guidance from Zeger, your AI recovery coach.
            </p>
          </div>
        </div>

        {/* 2. Burnout Score Card & 3. User Goal Progress */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Burnout Risk Score Card */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <RiAlarmWarningLine className="h-6 w-6 text-primary" />
                    Burnout Risk Score
                  </CardTitle>
                  <CardDescription>Your burnout risk is moderate and rising slightly</CardDescription>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300 text-lg px-4 py-2">
                  🟡 Moderate
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold text-foreground">
                  {burnoutData.burnoutScore}<span className="text-2xl text-muted-foreground">/10</span>
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-sm text-muted-foreground">Trend (5 weeks)</span>
                  </div>
                  <LineChart data={burnoutData.burnoutHistory} className="h-12" color="orange" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  <strong>Alert:</strong> Your score increased from 5 to 6 this week. Time to prioritize recovery.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Breathwork Streak Challenge */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <RiFlagLine className="h-6 w-6 text-primary" />
                Breathwork Streak Challenge
              </CardTitle>
              <CardDescription>{burnoutData.userGoal}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{burnoutData.breathworkStreak.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{burnoutData.breathworkStreak.targetStreak}</div>
                  <div className="text-sm text-muted-foreground">Target</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">{burnoutData.breathworkStreak.targetStreak - burnoutData.breathworkStreak.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Days Left</div>
                </div>
              </div>
              
              {/* 7-day visual tracker */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Last 7 Days</div>
                <div className="flex justify-between gap-1">
                  {burnoutData.breathworkStreak.completedDays.map((completed, index) => {
                    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    const isToday = index === 6 // Assuming today is the last day
                    return (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div className="text-xs text-muted-foreground font-medium">
                          {dayNames[index]}
                        </div>
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : isToday 
                                ? 'border-orange-500 bg-orange-50 text-orange-600' 
                                : 'border-gray-300 bg-gray-50 text-gray-400'
                          }`}
                        >
                          {completed ? (
                            <RiCheckLine className="h-4 w-4" />
                          ) : isToday ? (
                            <RiTimeLine className="h-4 w-4" />
                          ) : (
                            <RiCloseLine className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Progress message */}
                <div className="text-center mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    {burnoutData.breathworkStreak.currentStreak === 0 
                      ? "Start your streak today! 🫁" 
                      : `Great work! ${burnoutData.breathworkStreak.targetStreak - burnoutData.breathworkStreak.currentStreak} more days to complete your challenge! 🔥`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. HRV Daily Readings */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <RiHeartPulseLine className="h-6 w-6 text-primary" />
            Today's HRV Readings
          </h2>
          <Card className="bg-card border shadow-sm mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">HRV (RMSSD)</CardTitle>
                  <CardDescription className="text-red-600">Strained - Normal range: 20-80 ms</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-500">44 ms</div>
                  <div className="text-sm text-muted-foreground">Current</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <svg width="100%" height="140" className="overflow-visible">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="hrvGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-20"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="120" fill="url(#hrvGrid)" />
                  
                  {/* Chart background */}
                  <rect x="0" y="0" width="100%" height="120" fill="transparent" stroke="currentColor" strokeWidth="1" className="text-border opacity-30" rx="4"/>
                  
                  {/* Y-axis reference line at 50ms */}
                  <line x1="0" y1="60" x2="100%" y2="60" stroke="currentColor" strokeWidth="1" className="text-green-500 opacity-30" strokeDasharray="4,4"/>
                  <text x="10" y="55" className="text-xs fill-green-600 font-medium">50 ms</text>
                  
                  {/* Data points and line */}
                  {burnoutData.dailyHRVReadings.map((reading, index) => {
                    const x = 60 + (index * 80) // Start from 60px, space by 80px
                    const y = 120 - ((reading.value - 30) / 30 * 80) // Scale to fit 30-60ms range in 80px height
                    const nextReading = burnoutData.dailyHRVReadings[index + 1]
                    const nextX = 60 + ((index + 1) * 80)
                    const nextY = nextReading ? 120 - ((nextReading.value - 30) / 30 * 80) : y
                    
                    const dotColor = reading.status === 'good' ? 'text-green-500' : reading.status === 'moderate' ? 'text-yellow-500' : 'text-red-500'
                    
                    return (
                      <g key={index}>
                        {/* Line to next point */}
                        {nextReading && (
                          <line 
                            x1={x} 
                            y1={y} 
                            x2={nextX} 
                            y2={nextY} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            className="text-gray-400"
                          />
                        )}
                        
                        {/* Data point */}
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="currentColor"
                          className={dotColor}
                          stroke="white"
                          strokeWidth="2"
                        />
                        
                        {/* Time label */}
                        <text 
                          x={x} 
                          y="135" 
                          textAnchor="middle" 
                          className="text-xs fill-muted-foreground font-medium"
                          transform={`rotate(-45 ${x} 135)`}
                        >
                          {reading.time}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>The parasympathetic nervous system, which is responsible for rest, isn't active enough.</strong></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5. Metric Explanations */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <RiBrainLine className="h-6 w-6 text-primary" />
            Understanding Your Metrics
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* HRV Explanation */}
            <Card className="bg-card border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <RiHeartPulseLine className="h-5 w-5 text-primary" />
                  HRV (Heart Rate Variability)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground mb-1">What it is:</h4>
                  <p className="text-sm text-muted-foreground">
                    HRV measures the tiny differences in time between your heartbeats.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">What it means:</h4>
                  <p className="text-sm text-muted-foreground">
                    Higher HRV usually means your body is more relaxed and recovering well. Lower HRV can signal stress, fatigue, or overtraining.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Why it matters:</h4>
                  <p className="text-sm text-muted-foreground">
                    It's one of the best indicators of how well your nervous system is handling stress — both physical and emotional.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stress Level Explanation */}
            <Card className="bg-card border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <RiSpeedLine className="h-5 w-5 text-primary" />
                  Stress Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground mb-1">What it is:</h4>
                  <p className="text-sm text-muted-foreground">
                    Your stress score reflects your body's current physiological tension, based on heart rate, HRV, and breathing patterns.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">How it's calculated:</h4>
                  <p className="text-sm text-muted-foreground">
                    We look at spikes in resting heart rate, dips in HRV, and elevated breathing rate — all signs your body is in "fight or flight" mode.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Why it matters:</h4>
                  <p className="text-sm text-muted-foreground">
                    A high stress score shows your body is working hard to cope — even if you feel "fine."
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Burnout Score Explanation */}
            <Card className="bg-card border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <RiAlarmWarningLine className="h-5 w-5 text-primary" />
                  Burnout Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground mb-1">What it is:</h4>
                  <p className="text-sm text-muted-foreground">
                    Your burnout score rates how close your body is to tipping into exhaustion or overload — mentally and physically.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">How it's calculated:</h4>
                  <p className="text-sm text-muted-foreground">
                    We combine HRV trends, sleep quality, resting heart rate, stress levels, and activity patterns into a simple 0–10 score.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Why it matters:</h4>
                  <p className="text-sm text-muted-foreground">
                    A higher score means it's time to slow down and recover. Catching it early helps you avoid fatigue, illness, or mental burnout.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 6. Metrics & Graph Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <RiHeartPulseLine className="h-6 w-6 text-primary" />
            Biometric Insights
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BurnoutMetricCard
              title="HRV Trend"
              value={burnoutData.hrvTrend}
              unit="%"
              trend={Math.abs(burnoutData.hrvTrend)}
              icon={RiHeartPulseLine}
              status="warning"
            />
            <BurnoutMetricCard
              title="Deep Sleep"
              value={burnoutData.deepSleepPct}
              unit="%"
              icon={RiMoonLine}
              status="warning"
            />
            <BurnoutMetricCard
              title="RHR Trend"
              value={`+${burnoutData.rhrTrend}`}
              unit=" bpm"
              trend={burnoutData.rhrTrend}
              icon={RiHeartPulseLine}
              status="warning"
            />
            <BurnoutMetricCard
              title="Stress Score"
              value={burnoutData.stressScore}
              unit="/100"
              icon={RiSpeedLine}
              status="warning"
            />
            <BurnoutMetricCard
              title="Step Trend"
              value={burnoutData.stepTrend}
              icon={RiRunLine}
              status="critical"
            />
            <BurnoutMetricCard
              title="Recovery Score"
              value={burnoutData.recoveryScore}
              unit="/100"
              icon={RiLeafLine}
              status="good"
            />
          </div>
        </div>

        {/* 7. AI Coach Insight from Zeger */}
        <Card className="bg-card border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <RiRobotLine className="h-6 w-6 text-primary" />
              Zeger's AI Analysis
            </CardTitle>
            <CardDescription>Personalized insights from your recovery coach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed mb-4">
                  <strong>Hi Andrew.</strong> Your HRV has declined and your resting heart rate has crept up — early signs of stress accumulation. You're getting just 16.8% deep sleep, which may impair recovery. Your recovery score of 64 shows you're still coping well, but you're slipping below optimal thresholds.
                </p>
                <p className="text-foreground leading-relaxed mb-4">
                  Over the next 3–5 days, scale back intensity, add gentle evening breathwork, and lock in a consistent sleep window. You're halfway to your goal — let's keep momentum!
                </p>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <RiSparklingLine className="h-4 w-4" />
                  <span>— Zeger, your AI Recovery Coach</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 8. Personalized Recovery Prompts */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <RiCheckboxCircleLine className="h-6 w-6 text-primary" />
            Recovery Action Plan
          </h2>
          <div className="space-y-3">
            <RecoveryPrompt
              icon="🧘"
              title="Evening wind-down: 15 min breathwork or meditation"
              description="Practice box breathing (4-4-4-4) or guided meditation to activate your parasympathetic nervous system"
              completed={completedPrompts.has(1)}
            />
            <RecoveryPrompt
              icon="🛌"
              title="Sleep protection: Set a 10:30pm phone-free cutoff"
              description="Blue light disrupts melatonin production. Create a tech-free wind-down routine"
              completed={completedPrompts.has(2)}
            />
            <RecoveryPrompt
              icon="🚶"
              title="Movement: 30 min light walking + mobility"
              description="Gentle movement promotes circulation and stress relief without adding training load"
              completed={completedPrompts.has(3)}
            />
            <RecoveryPrompt
              icon="🍵"
              title="Supportive nutrition: Prioritize magnesium-rich foods"
              description="Dark leafy greens, nuts, seeds, and whole grains support muscle relaxation and sleep"
              completed={completedPrompts.has(4)}
            />
            <RecoveryPrompt
              icon="📱"
              title="Digital hygiene: Cut work screen time by 30 mins/day"
              description="Reduce cognitive load and stress by setting boundaries with technology"
              completed={completedPrompts.has(5)}
            />
          </div>
        </div>

        {/* 9. Wellness Radar Chart */}
        <Card className="bg-card border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <RiFlashlightLine className="h-6 w-6 text-primary" />
              Your Holistic Wellness Snapshot
            </CardTitle>
            <CardDescription>Visual overview of your wellness across all dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <RadarChart data={burnoutData.radarMetrics} />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 flex-1 w-full">
                {Object.entries(burnoutData.radarMetrics).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <div className="flex-1">
                      <div className="text-sm font-medium capitalize text-foreground">{key}</div>
                      <div className="text-xs text-muted-foreground">{value}/10</div>
                    </div>
                    <div className="text-lg font-bold text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Key Focus Areas:</strong> Your stress levels (6.9/10) and movement (3.5/10) need immediate attention. 
                These are your highest-impact areas for reducing burnout risk.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
