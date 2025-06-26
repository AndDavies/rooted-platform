import { DynamicTool } from "@langchain/core/tools"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface SleepDataRecord {
  value: string
  timestamp: string
  metric_type: string
}

interface DailySleepData {
  date: string
  totalSeconds?: number
  deepSeconds?: number
  remSeconds?: number
  lightSeconds?: number
  awakeSeconds?: number
}

export function getSleepTrendsTool(userId?: string) {
  return new DynamicTool({
    name: "getSleepTrends",
    description: "Analyzes comprehensive sleep patterns over the past 7-14 days including total sleep time, sleep stages (deep, REM, light), sleep efficiency, and provides personalized recommendations for sleep optimization.",
    func: async () => {
      try {
        if (!userId) {
          return "I need you to be logged in to analyze your sleep patterns. Please sign in to access your sleep data."
        }

        // Get user's Garmin connection
        const { data: connection, error: connError } = await (supabaseAdmin as any)
          .from('wearable_connections')
          .select('id')
          .eq('user_id', userId)
          .eq('wearable_type', 'garmin')
          .maybeSingle()

        if (connError || !connection) {
          return "I couldn't find your Garmin device connection. Please make sure your Garmin device is connected to get sleep insights."
        }

        const connectionId = connection.id
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

        // Get all sleep-related metrics for the past 14 days
        const { data: sleepData, error: dataError } = await (supabaseAdmin as any)
          .from('wearable_data')
          .select('value, timestamp, metric_type')
          .eq('connection_id', connectionId)
          .in('metric_type', [
            'sleep_total_seconds',
            'sleep_deep_seconds', 
            'sleep_rem_seconds',
            'sleep_light_seconds',
            'sleep_awake_seconds'
          ])
          .gte('timestamp', fourteenDaysAgo.toISOString())
          .order('timestamp', { ascending: false })

        if (dataError || !sleepData || sleepData.length === 0) {
          return "I don't have any sleep data from your Garmin device yet. Make sure your device is tracking sleep and syncing regularly. Sleep tracking requires wearing your device overnight."
        }

        // Group sleep data by date
        const sleepByDate: { [date: string]: DailySleepData } = {}
        
        sleepData.forEach((record: SleepDataRecord) => {
          const date = new Date(record.timestamp).toISOString().split('T')[0]
          if (!sleepByDate[date]) {
            sleepByDate[date] = { date }
          }
          
          const value = parseFloat(record.value)
          switch (record.metric_type) {
            case 'sleep_total_seconds':
              sleepByDate[date].totalSeconds = value
              break
            case 'sleep_deep_seconds':
              sleepByDate[date].deepSeconds = value
              break
            case 'sleep_rem_seconds':
              sleepByDate[date].remSeconds = value
              break
            case 'sleep_light_seconds':
              sleepByDate[date].lightSeconds = value
              break
            case 'sleep_awake_seconds':
              sleepByDate[date].awakeSeconds = value
              break
          }
        })

        // Filter to complete nights with total sleep data
        const validNights = Object.values(sleepByDate)
          .filter((night: DailySleepData) => night.totalSeconds && night.totalSeconds > 0)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (validNights.length === 0) {
          return "No complete sleep data found in the past 14 days. Make sure you're wearing your Garmin device consistently overnight for accurate sleep tracking."
        }

        // Split into recent (last 7 days) and comparison periods
        const recentNights = validNights.slice(0, 7)
        const olderNights = validNights.slice(7, 14)

        // Calculate averages for recent period
        const avgTotalHours = recentNights.reduce((sum, night) => sum + (night.totalSeconds || 0), 0) / recentNights.length / 3600
        const avgDeepSeconds = recentNights.reduce((sum, night) => sum + (night.deepSeconds || 0), 0) / recentNights.length
        const avgRemSeconds = recentNights.reduce((sum, night) => sum + (night.remSeconds || 0), 0) / recentNights.length
        const avgLightSeconds = recentNights.reduce((sum, night) => sum + (night.lightSeconds || 0), 0) / recentNights.length

        // Calculate sleep stage percentages
        const totalSleepSeconds = recentNights.reduce((sum, night) => sum + (night.totalSeconds || 0), 0) / recentNights.length
        const deepPercent = Math.round((avgDeepSeconds / totalSleepSeconds) * 100)
        const remPercent = Math.round((avgRemSeconds / totalSleepSeconds) * 100)
        const lightPercent = Math.round((avgLightSeconds / totalSleepSeconds) * 100)

        // Trend comparison if we have older data
        let trendMessage = ""
        if (olderNights.length > 0) {
          const oldAvgHours = olderNights.reduce((sum, night) => sum + (night.totalSeconds || 0), 0) / olderNights.length / 3600
          const hoursDiff = avgTotalHours - oldAvgHours
          
          if (Math.abs(hoursDiff) > 0.3) {
            const trend = hoursDiff > 0 ? "increased" : "decreased"
            trendMessage = `Your average sleep duration has ${trend} by ${Math.abs(hoursDiff).toFixed(1)} hours compared to the previous week. `
          } else {
            trendMessage = "Your sleep duration has remained consistent over the past two weeks. "
          }
        }

        // Generate insights and recommendations
        const insights: string[] = []
        const recommendations: string[] = []

        // Sleep duration analysis
        if (avgTotalHours < 7) {
          insights.push(`Your average sleep of ${avgTotalHours.toFixed(1)} hours is below the recommended 7-9 hours for adults.`)
          recommendations.push("Aim to go to bed 30-60 minutes earlier to increase total sleep time")
          recommendations.push("Create a consistent bedtime routine to signal your body it's time to sleep")
        } else if (avgTotalHours >= 7 && avgTotalHours <= 9) {
          insights.push(`Your average sleep duration of ${avgTotalHours.toFixed(1)} hours is within the healthy range.`)
        } else {
          insights.push(`Your average sleep of ${avgTotalHours.toFixed(1)} hours is above 9 hours, which may indicate recovery debt or underlying health factors.`)
        }

        // Deep sleep analysis
        if (deepPercent < 15) {
          insights.push(`Your deep sleep percentage (${deepPercent}%) is below the optimal 15-20% range.`)
          recommendations.push("Keep your bedroom cool (65-68°F) as temperature drop promotes deep sleep")
          recommendations.push("Avoid screens 1-2 hours before bed to improve sleep quality")
          recommendations.push("Consider magnesium supplementation 30-60 minutes before bed")
        } else if (deepPercent >= 15 && deepPercent <= 23) {
          insights.push(`Your deep sleep percentage (${deepPercent}%) is in the optimal range.`)
        } else {
          insights.push(`Your deep sleep percentage (${deepPercent}%) is higher than typical, which can happen during recovery periods.`)
        }

        // REM sleep analysis  
        if (remPercent < 20) {
          insights.push(`Your REM sleep percentage (${remPercent}%) could be improved (optimal range: 20-25%).`)
          recommendations.push("Maintain consistent sleep and wake times, even on weekends")
          recommendations.push("Limit alcohol consumption, especially within 3 hours of bedtime")
          recommendations.push("Manage stress through meditation or journaling before sleep")
        } else if (remPercent >= 20 && remPercent <= 25) {
          insights.push(`Your REM sleep percentage (${remPercent}%) is in the healthy range.`)
        }

        // Sleep consistency analysis
        const sleepVariability = Math.sqrt(
          recentNights.reduce((sum, night) => {
            const diff = (night.totalSeconds || 0) / 3600 - avgTotalHours
            return sum + diff * diff
          }, 0) / recentNights.length
        )

        if (sleepVariability > 1) {
          insights.push("Your sleep timing varies significantly night to night.")
          recommendations.push("Try to maintain consistent bedtime and wake times within 30 minutes")
        }

        const response = `
## Sleep Quality Analysis (Last ${recentNights.length} Nights)

${trendMessage}

**Sleep Duration:** ${avgTotalHours.toFixed(1)} hours average
**Sleep Stages:** ${deepPercent}% Deep • ${remPercent}% REM • ${lightPercent}% Light

**Key Insights:**
${insights.map(insight => `• ${insight}`).join('\n')}

**Why Sleep Stages Matter:**
• **Deep Sleep**: Critical for physical recovery, immune function, and memory consolidation
• **REM Sleep**: Essential for cognitive function, emotional processing, and creativity  
• **Light Sleep**: Helps transition between stages and accounts for ~50-60% of total sleep

**Personalized Recommendations:**
${recommendations.length > 0 
  ? recommendations.map(rec => `• ${rec}`).join('\n')
  : '• Continue with your current sleep practices - your patterns look healthy'}

*Based on ${recentNights.length} nights of sleep data*
        `.trim()

        return response

      } catch (error) {
        console.error("Error analyzing sleep trends:", error)
        return "I encountered an error while analyzing your sleep data. This could be a temporary issue with data access. Please try again in a moment."
      }
    },
  })
} 