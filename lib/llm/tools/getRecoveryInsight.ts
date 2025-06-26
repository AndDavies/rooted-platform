import { DynamicTool } from "@langchain/core/tools"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface MetricData {
  value: string
  timestamp: string
  metric_type: string
}

interface RecoveryMetrics {
  avgHRV: number | null
  avgRHR: number | null
  avgSleepHours: number | null
  avgStressScore: number | null
  deepSleepPercent: number | null
  dataQuality: {
    hrvDays: number
    sleepDays: number
    stressDays: number
  }
}

export function getRecoveryInsightTool(userId?: string) {
  return new DynamicTool({
    name: "getRecoveryInsight",
    description: "Provides a comprehensive recovery assessment by combining HRV, sleep quality, resting heart rate, and stress metrics into a single coaching summary with an overall recovery score and personalized recommendations.",
    func: async () => {
      try {
        if (!userId) {
          return "I need you to be logged in to provide your recovery insights. Please sign in to access your comprehensive recovery analysis."
        }

        // Get user's Garmin connection
        const { data: connection, error: connError } = await (supabaseAdmin as any)
          .from('wearable_connections')
          .select('id')
          .eq('user_id', userId)
          .eq('wearable_type', 'garmin')
          .maybeSingle()

        if (connError || !connection) {
          return "I couldn't find your Garmin device connection. Please connect your Garmin device to get comprehensive recovery insights."
        }

        const connectionId = connection.id
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        // Get all relevant recovery metrics for the past 7 days
        const { data: metricsData, error: dataError } = await (supabaseAdmin as any)
          .from('wearable_data')
          .select('value, timestamp, metric_type')
          .eq('connection_id', connectionId)
          .in('metric_type', [
            'hrv_rmssd',
            'heart_rate_resting',
            'sleep_total_seconds',
            'sleep_deep_seconds',
            'stress_avg'
          ])
          .gte('timestamp', sevenDaysAgo.toISOString())
          .order('timestamp', { ascending: false })

        if (dataError || !metricsData || metricsData.length === 0) {
          return "I don't have enough recovery data from your Garmin device yet. Make sure your device is syncing regularly and tracking sleep, HRV, and stress metrics."
        }

        // Process and group metrics
        const metrics = metricsData.reduce((acc: { [key: string]: number[] }, record: MetricData) => {
          if (!acc[record.metric_type]) acc[record.metric_type] = []
          acc[record.metric_type].push(parseFloat(record.value))
          return acc
        }, {})

        // Calculate averages and assess data quality
        const recoveryMetrics: RecoveryMetrics = {
          avgHRV: metrics.hrv_rmssd ? metrics.hrv_rmssd.reduce((a: number, b: number) => a + b, 0) / metrics.hrv_rmssd.length : null,
          avgRHR: metrics.heart_rate_resting ? metrics.heart_rate_resting.reduce((a: number, b: number) => a + b, 0) / metrics.heart_rate_resting.length : null,
          avgSleepHours: metrics.sleep_total_seconds ? (metrics.sleep_total_seconds.reduce((a: number, b: number) => a + b, 0) / metrics.sleep_total_seconds.length) / 3600 : null,
          avgStressScore: metrics.stress_avg ? metrics.stress_avg.reduce((a: number, b: number) => a + b, 0) / metrics.stress_avg.length : null,
          deepSleepPercent: null,
          dataQuality: {
            hrvDays: metrics.hrv_rmssd?.length || 0,
            sleepDays: metrics.sleep_total_seconds?.length || 0,
            stressDays: metrics.stress_avg?.length || 0
          }
        }

        // Calculate deep sleep percentage if we have the data
        if (metrics.sleep_deep_seconds && metrics.sleep_total_seconds) {
          const avgDeepSeconds = metrics.sleep_deep_seconds.reduce((a: number, b: number) => a + b, 0) / metrics.sleep_deep_seconds.length
          const avgTotalSeconds = metrics.sleep_total_seconds.reduce((a: number, b: number) => a + b, 0) / metrics.sleep_total_seconds.length
          recoveryMetrics.deepSleepPercent = Math.round((avgDeepSeconds / avgTotalSeconds) * 100)
        }

        // Calculate overall recovery score (0-100)
        let recoveryScore = 0
        let scoringFactors: string[] = []

        // HRV scoring (0-30 points)
        if (recoveryMetrics.avgHRV !== null) {
          if (recoveryMetrics.avgHRV >= 50) {
            recoveryScore += 30
            scoringFactors.push("Excellent HRV (+30)")
          } else if (recoveryMetrics.avgHRV >= 35) {
            recoveryScore += 22
            scoringFactors.push("Good HRV (+22)")
          } else if (recoveryMetrics.avgHRV >= 25) {
            recoveryScore += 15
            scoringFactors.push("Fair HRV (+15)")
          } else {
            recoveryScore += 8
            scoringFactors.push("Low HRV (+8)")
          }
        }

        // Sleep scoring (0-25 points)
        if (recoveryMetrics.avgSleepHours !== null) {
          if (recoveryMetrics.avgSleepHours >= 7.5 && recoveryMetrics.avgSleepHours <= 9) {
            recoveryScore += 25
            scoringFactors.push("Optimal sleep duration (+25)")
          } else if (recoveryMetrics.avgSleepHours >= 7 || recoveryMetrics.avgSleepHours <= 9.5) {
            recoveryScore += 18
            scoringFactors.push("Good sleep duration (+18)")
          } else {
            recoveryScore += 10
            scoringFactors.push("Suboptimal sleep duration (+10)")
          }
        }

        // RHR scoring (0-20 points)
        if (recoveryMetrics.avgRHR !== null) {
          if (recoveryMetrics.avgRHR <= 55) {
            recoveryScore += 20
            scoringFactors.push("Excellent RHR (+20)")
          } else if (recoveryMetrics.avgRHR <= 65) {
            recoveryScore += 15
            scoringFactors.push("Good RHR (+15)")
          } else if (recoveryMetrics.avgRHR <= 75) {
            recoveryScore += 10
            scoringFactors.push("Fair RHR (+10)")
          } else {
            recoveryScore += 5
            scoringFactors.push("Elevated RHR (+5)")
          }
        }

        // Stress scoring (0-15 points)
        if (recoveryMetrics.avgStressScore !== null) {
          if (recoveryMetrics.avgStressScore <= 25) {
            recoveryScore += 15
            scoringFactors.push("Low stress levels (+15)")
          } else if (recoveryMetrics.avgStressScore <= 35) {
            recoveryScore += 10
            scoringFactors.push("Moderate stress levels (+10)")
          } else {
            recoveryScore += 5
            scoringFactors.push("High stress levels (+5)")
          }
        }

        // Deep sleep bonus (0-10 points)
        if (recoveryMetrics.deepSleepPercent !== null) {
          if (recoveryMetrics.deepSleepPercent >= 18) {
            recoveryScore += 10
            scoringFactors.push("Excellent deep sleep (+10)")
          } else if (recoveryMetrics.deepSleepPercent >= 15) {
            recoveryScore += 7
            scoringFactors.push("Good deep sleep (+7)")
          } else {
            recoveryScore += 3
            scoringFactors.push("Low deep sleep (+3)")
          }
        }

        // Generate recovery status and recommendations
        let recoveryStatus = ""
        let statusColor = ""
        let recommendations: string[] = []

        if (recoveryScore >= 80) {
          recoveryStatus = "EXCELLENT"
          statusColor = "🟢"
          recommendations.push("Your recovery is outstanding - you're ready for high-intensity training")
          recommendations.push("Consider progressive overload in your workouts")
          recommendations.push("Maintain your current sleep and stress management practices")
        } else if (recoveryScore >= 65) {
          recoveryStatus = "GOOD"  
          statusColor = "🟡"
          recommendations.push("Your recovery is solid - moderate to high intensity training is appropriate")
          recommendations.push("Focus on one area for improvement to reach excellent recovery")
          recommendations.push("Continue consistent sleep and recovery habits")
        } else if (recoveryScore >= 45) {
          recoveryStatus = "FAIR"
          statusColor = "🟠"
          recommendations.push("Your recovery needs attention - consider lighter training loads")
          recommendations.push("Prioritize sleep quality and stress management")
          recommendations.push("Consider adding recovery activities like gentle yoga or walking")
        } else {
          recoveryStatus = "POOR"
          statusColor = "🔴"
          recommendations.push("Your body needs significant recovery - focus on rest and restoration")
          recommendations.push("Reduce training intensity and volume for the next few days")
          recommendations.push("Prioritize sleep, stress reduction, and gentle movement only")
        }

        // Generate key insights
        const insights: string[] = []
        
        if (recoveryMetrics.avgHRV && recoveryMetrics.avgHRV < 30) {
          insights.push("Low HRV suggests your nervous system is under stress")
        }
        if (recoveryMetrics.avgSleepHours && recoveryMetrics.avgSleepHours < 7) {
          insights.push("Insufficient sleep is likely impacting your recovery")
        }
        if (recoveryMetrics.avgStressScore && recoveryMetrics.avgStressScore > 40) {
          insights.push("Elevated stress levels are affecting your recovery capacity")
        }
        if (recoveryMetrics.avgRHR && recoveryMetrics.avgRHR > 70) {
          insights.push("Elevated resting heart rate may indicate incomplete recovery")
        }

        const response = `
## Recovery Assessment ${statusColor}

**Overall Recovery Score: ${recoveryScore}/100 (${recoveryStatus})**

**Your Recovery Metrics (7-day average):**
${recoveryMetrics.avgHRV ? `• HRV: ${Math.round(recoveryMetrics.avgHRV)}ms` : '• HRV: No data available'}
${recoveryMetrics.avgSleepHours ? `• Sleep: ${recoveryMetrics.avgSleepHours.toFixed(1)} hours` : '• Sleep: No data available'}
${recoveryMetrics.avgRHR ? `• Resting HR: ${Math.round(recoveryMetrics.avgRHR)} bpm` : '• Resting HR: No data available'}
${recoveryMetrics.avgStressScore ? `• Stress Level: ${Math.round(recoveryMetrics.avgStressScore)}/100` : '• Stress: No data available'}
${recoveryMetrics.deepSleepPercent ? `• Deep Sleep: ${recoveryMetrics.deepSleepPercent}%` : '• Deep Sleep: No data available'}

**Key Insights:**
${insights.length > 0 
  ? insights.map(insight => `• ${insight}`).join('\n')
  : '• Your recovery metrics are generally trending in a positive direction'}

**Your Recovery Action Plan:**
${recommendations.map(rec => `• ${rec}`).join('\n')}

**Data Quality:** Based on ${Math.max(recoveryMetrics.dataQuality.hrvDays, recoveryMetrics.dataQuality.sleepDays, recoveryMetrics.dataQuality.stressDays)} days of data

*Your recovery score combines HRV, sleep quality, resting heart rate, and stress levels to give you a comprehensive view of your body's readiness.*
        `.trim()

        return response

      } catch (error) {
        console.error("Error generating recovery insight:", error)
        return "I encountered an error while analyzing your recovery data. This could be a temporary issue with data access. Please try again in a moment."
      }
    },
  })
} 