import { DynamicTool } from "@langchain/core/tools"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface BurnoutRiskOutput {
  score: number // 0-10
  level: "low" | "moderate" | "high"
  summary: string // human-readable insight
  contributingMetrics: {
    hrvDrop: number
    deepSleepPct: number
    stressAvg: number
    rhrTrend: number
    stepsTrend: "increasing" | "decreasing" | "stable"
  }
  detailedAssessment: {
    overallRiskLevel: string
    riskScore: number
    keyIndicators: any
    warningSignsPresent: string[]
    protectiveFactorsPresent: string[]
    immediateRecommendations: any[]
    preventionStrategy: any
    redFlagIndicators: any
    recoveryTimeline: any
    positivePrognosisFactors: string[]
  }
}

export function checkBurnoutRiskTool(userId?: string) {
  return new DynamicTool({
    name: "checkBurnoutRisk",
    description: "Evaluates burnout risk by analyzing patterns in HRV, sleep quality, stress indicators, and recovery metrics to provide early warning signs and prevention strategies. Returns both structured data and natural language summary. This tool requires no input parameters - just call it to get the user's burnout risk assessment.",
    func: async () => {
      try {
        if (!userId) {
          return JSON.stringify({
            error: "User not authenticated",
            message: "Please log in to receive your burnout risk assessment."
          })
        }

        // Get user's wearable connection
        const { data: connection } = await (supabaseAdmin as any)
          .from('wearable_connections')
          .select('id')
          .eq('user_id', userId)
          .eq('wearable_type', 'garmin')
          .maybeSingle()

        if (!connection) {
          return JSON.stringify({
            error: "No wearable device connected",
            message: "Please connect a wearable device to assess burnout risk."
          })
        }

        // Get recent metrics (last 14 days for trend analysis)
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

        const { data: metrics } = await (supabaseAdmin as any)
          .from('wearable_data')
          .select('metric_type, value, timestamp')
          .eq('connection_id', connection.id)
          .in('metric_type', ['hrv_rmssd', 'heart_rate_resting', 'sleep_total_seconds', 'sleep_deep_seconds', 'stress_avg', 'steps'])
          .gte('timestamp', fourteenDaysAgo)
          .order('timestamp', { ascending: true })

        const burnoutAssessment = calculateBurnoutRisk(metrics || [])
        
        return JSON.stringify(burnoutAssessment)
      } catch (error) {
        console.error("Error checking burnout risk:", error)
        return JSON.stringify({
          error: "Failed to assess burnout risk",
          message: "There was an error evaluating your burnout risk. Please try again later."
        })
      }
    },
  })
}

function calculateBurnoutRisk(metrics: any[]): BurnoutRiskOutput {
  // Group metrics by type
  const metricsByType = metrics.reduce((acc, metric) => {
    const type = metric.metric_type
    if (!acc[type]) acc[type] = []
    acc[type].push(metric)
    return acc
  }, {} as Record<string, any[]>)

  // Calculate contributing metrics
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  // HRV drop calculation
  const hrvMetrics = metricsByType['hrv_rmssd'] || []
  const recentHrv = getAverageForPeriod(hrvMetrics, sevenDaysAgo)
  const previousHrv = getAverageForPeriod(hrvMetrics, fourteenDaysAgo, sevenDaysAgo)
  const hrvDrop = previousHrv > 0 ? ((previousHrv - recentHrv) / previousHrv) * 100 : 0

  // Deep sleep percentage
  const sleepTotalMetrics = metricsByType['sleep_total_seconds'] || []
  const sleepDeepMetrics = metricsByType['sleep_deep_seconds'] || []
  const avgTotalSleep = getAverageForPeriod(sleepTotalMetrics, sevenDaysAgo)
  const avgDeepSleep = getAverageForPeriod(sleepDeepMetrics, sevenDaysAgo)
  const deepSleepPct = avgTotalSleep > 0 ? (avgDeepSleep / avgTotalSleep) * 100 : 0

  // Stress average
  const stressMetrics = metricsByType['stress_avg'] || []
  const stressAvg = getAverageForPeriod(stressMetrics, sevenDaysAgo)

  // RHR trend
  const rhrMetrics = metricsByType['heart_rate_resting'] || []
  const recentRhr = getAverageForPeriod(rhrMetrics, sevenDaysAgo)
  const previousRhr = getAverageForPeriod(rhrMetrics, fourteenDaysAgo, sevenDaysAgo)
  const rhrTrend = recentRhr - previousRhr

  // Steps trend
  const stepsMetrics = metricsByType['steps'] || []
  const recentSteps = getAverageForPeriod(stepsMetrics, sevenDaysAgo)
  const previousSteps = getAverageForPeriod(stepsMetrics, fourteenDaysAgo, sevenDaysAgo)
  const stepsChange = previousSteps > 0 ? ((recentSteps - previousSteps) / previousSteps) * 100 : 0
  
  let stepsTrend: "increasing" | "decreasing" | "stable" = "stable"
  if (Math.abs(stepsChange) > 10) {
    stepsTrend = stepsChange > 0 ? "increasing" : "decreasing"
  }

  // Calculate burnout score using the specified logic
  let score = 0
  if (hrvDrop > 15) score += 3
  if (deepSleepPct < 18) score += 2
  if (stressAvg > 60) score += 2 // Simplified - should check for 3+ days
  if (rhrTrend > 3) score += 2
  if (stepsTrend === "decreasing") score += 1

  // Determine risk level
  let level: "low" | "moderate" | "high" = "low"
  if (score >= 7) level = "high"
  else if (score >= 4) level = "moderate"

  // Generate human-readable summary
  const summary = generateBurnoutSummary(score, level, {
    hrvDrop,
    deepSleepPct,
    stressAvg,
    rhrTrend,
    stepsTrend
  })

  // Detailed assessment (existing structure)
  const detailedAssessment = {
    overallRiskLevel: level === "high" ? "High Risk" : level === "moderate" ? "Moderate Risk" : "Low Risk",
    riskScore: score,
    keyIndicators: {
      physiological: {
        hrvTrend: {
          status: hrvDrop > 15 ? "Declining" : hrvDrop > 5 ? "Slightly Declining" : "Stable",
          severity: hrvDrop > 15 ? "High" : hrvDrop > 5 ? "Moderate" : "Low",
          details: `HRV has ${hrvDrop > 0 ? 'decreased' : 'increased'} ${Math.abs(hrvDrop).toFixed(1)}% over the past week`,
          impact: hrvDrop > 15 ? "High" : "Medium"
        },
        sleepQuality: {
          status: deepSleepPct < 15 ? "Poor" : deepSleepPct < 20 ? "Compromised" : "Good",
          severity: deepSleepPct < 15 ? "High" : deepSleepPct < 20 ? "Moderate" : "Low",
          details: `Deep sleep represents ${deepSleepPct.toFixed(1)}% of total sleep`,
          impact: deepSleepPct < 15 ? "High" : "Medium"
        },
        restingHeartRate: {
          status: rhrTrend > 3 ? "Elevated" : rhrTrend > 1 ? "Slightly Elevated" : "Stable",
          severity: rhrTrend > 5 ? "High" : rhrTrend > 3 ? "Moderate" : "Low",
          details: `${Math.abs(rhrTrend).toFixed(1)} BPM ${rhrTrend > 0 ? 'increase' : 'decrease'} from previous week`,
          impact: rhrTrend > 3 ? "Medium" : "Low"
        },
        recoveryMetrics: {
          status: score >= 7 ? "Poor" : score >= 4 ? "Compromised" : "Good",
          severity: score >= 7 ? "High" : score >= 4 ? "Moderate" : "Low",
          details: "Based on combined HRV, sleep, and stress indicators",
          impact: score >= 7 ? "High" : score >= 4 ? "Medium" : "Low"
        }
      },
      behavioral: {
        energyLevels: score >= 7 ? "Consistently low" : score >= 4 ? "Moderate fluctuations" : "Generally stable",
        motivationChanges: score >= 7 ? "Decreased enthusiasm" : score >= 4 ? "Some fluctuation" : "Maintained",
        cognitiveFunction: score >= 7 ? "Difficulty with focus" : score >= 4 ? "Occasional lapses" : "Clear thinking",
        emotionalState: score >= 7 ? "Increased irritability" : score >= 4 ? "Some stress reactivity" : "Balanced"
      }
    },
    warningSignsPresent: generateWarningSigns(score, { hrvDrop, deepSleepPct, stressAvg, rhrTrend, stepsTrend }),
    protectiveFactorsPresent: [
      "Maintaining consistent sleep schedule",
      "Regular biometric monitoring",
      "Awareness of stress levels",
      "Seeking data-driven insights"
    ],
    immediateRecommendations: generateRecommendations(score, level),
    preventionStrategy: {
      daily: [
        "Check HRV and recovery metrics each morning",
        "Practice 5-10 minutes of stress reduction",
        "Prioritize 7-9 hours of sleep",
        "Include gentle movement or walking"
      ],
      weekly: [
        "Review biometric trends",
        "Assess workload and make adjustments",
        "Schedule restorative activities",
        "Connect with supportive people"
      ],
      monthly: [
        "Comprehensive review of stress sources",
        "Evaluate and adjust goals",
        "Plan recovery periods",
        "Consider professional support if needed"
      ]
    },
    redFlagIndicators: {
      description: "Seek professional help immediately if experiencing:",
      signs: [
        "Persistent sleep disturbances despite good sleep hygiene",
        "Significant mood changes or depression symptoms",
        "Physical symptoms like chest pain or persistent headaches",
        "Complete loss of motivation or enjoyment",
        "Thoughts of self-harm",
        "Inability to function in work or personal relationships"
      ],
      action: "Contact healthcare provider or mental health professional"
    },
    recoveryTimeline: {
      week1: "Focus on sleep optimization and immediate stress reduction",
      week2_4: "Gradual energy improvement and metric stabilization",
      month2_3: "Return to full activity levels and improved resilience",
      ongoing: "Maintain preventive practices and regular monitoring"
    },
    positivePrognosisFactors: [
      "Early detection through biometric monitoring",
      "Data-driven approach to wellness",
      "Proactive health management",
      "Access to personalized insights"
    ]
  }

  return {
    score,
    level,
    summary,
    contributingMetrics: {
      hrvDrop,
      deepSleepPct,
      stressAvg,
      rhrTrend,
      stepsTrend
    },
    detailedAssessment
  }
}

function getAverageForPeriod(metrics: any[], startDate: Date, endDate?: Date): number {
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

function generateBurnoutSummary(score: number, level: string, metrics: any): string {
  const { hrvDrop, deepSleepPct, stressAvg, rhrTrend, stepsTrend } = metrics

  if (level === "high") {
    return `🔴 **High Burnout Risk** (Score: ${score}/10)\n\nYour biometrics show multiple concerning patterns that suggest significant burnout risk. Key issues include${hrvDrop > 15 ? ' a significant HRV decline,' : ''}${deepSleepPct < 18 ? ' insufficient deep sleep,' : ''}${stressAvg > 60 ? ' elevated stress levels,' : ''}${rhrTrend > 3 ? ' elevated resting heart rate,' : ''} and${stepsTrend === 'decreasing' ? ' decreased activity levels' : ' other recovery indicators'}. Immediate intervention is recommended to prevent further deterioration.`
  } else if (level === "moderate") {
    return `🟡 **Moderate Burnout Risk** (Score: ${score}/10)\n\nYour data shows some warning signs that warrant attention. You're experiencing${hrvDrop > 5 ? ' some HRV decline,' : ''}${deepSleepPct < 20 ? ' reduced deep sleep quality,' : ''}${stressAvg > 40 ? ' moderate stress levels,' : ''} and${rhrTrend > 1 ? ' slight changes in resting heart rate' : ' other minor recovery concerns'}. Now is a good time to implement preventive measures and closely monitor your recovery patterns.`
  } else {
    return `🔵 **Low Burnout Risk** (Score: ${score}/10)\n\nYour biometric patterns look stable and healthy overall. Your HRV, sleep quality, stress levels, and recovery metrics are within normal ranges. Continue your current wellness practices and maintain regular monitoring to catch any early changes before they become concerning.`
  }
}

function generateWarningSigns(score: number, metrics: any): string[] {
  const signs: string[] = []
  const { hrvDrop, deepSleepPct, stressAvg, rhrTrend, stepsTrend } = metrics

  if (hrvDrop > 15) signs.push("Significant HRV decline indicating poor recovery")
  if (deepSleepPct < 18) signs.push("Insufficient deep sleep affecting recovery")
  if (stressAvg > 60) signs.push("Elevated stress levels")
  if (rhrTrend > 3) signs.push("Rising resting heart rate trend")
  if (stepsTrend === "decreasing") signs.push("Declining activity levels")

  if (score >= 7) {
    signs.push("Multiple physiological stress indicators present")
    signs.push("Recovery capacity significantly compromised")
  } else if (score >= 4) {
    signs.push("Some concerning patterns emerging")
    signs.push("Recovery efficiency declining")
  }

  return signs
}

function generateRecommendations(score: number, level: string): any[] {
  const baseRecommendations = [
    {
      priority: "High",
      category: "Sleep Optimization",
      action: "Implement strict sleep hygiene",
      details: "Fixed bedtime, cool dark room, no screens 1 hour before bed",
      expectedTimeframe: "3-7 days for improvement"
    },
    {
      priority: "High",
      category: "Stress Reduction",
      action: "Daily stress management practice",
      details: "15 minutes of meditation, breathwork, or gentle yoga",
      expectedTimeframe: "1-2 weeks for benefits"
    }
  ]

  if (level === "high") {
    baseRecommendations.push(
      {
        priority: "High",
        category: "Activity Modification",
        action: "Reduce training intensity by 40-50%",
        details: "Focus on gentle movement and recovery activities only",
        expectedTimeframe: "Immediate implementation"
      },
      {
        priority: "High",
        category: "Professional Support",
        action: "Consider consulting healthcare provider",
        details: "Discuss symptoms and biometric patterns with a professional",
        expectedTimeframe: "Within 1 week"
      }
    )
  } else if (level === "moderate") {
    baseRecommendations.push({
      priority: "Medium",
      category: "Activity Modification",
      action: "Reduce training intensity by 20-30%",
      details: "Focus on gentle movement and recovery activities",
      expectedTimeframe: "Immediate implementation"
    })
  }

  baseRecommendations.push({
    priority: "Medium",
    category: "Nutrition Support",
    action: "Optimize meal timing and anti-inflammatory foods",
    details: "Regular meals, increase omega-3s, reduce processed foods",
    expectedTimeframe: "2-4 weeks for full benefits"
  })

  return baseRecommendations
} 