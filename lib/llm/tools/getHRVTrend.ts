// lib/llm/tools/getHRVTrend.ts
import { DynamicTool } from "@langchain/core/tools"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface WearableDataRecord {
  value: string
  timestamp: string
  metric_type: string
}

interface ProcessedDataPoint {
  value: number
  timestamp: Date
}

export function getHRVTrendTool(userId?: string) {
  return new DynamicTool({
    name: "getHRVTrend",
    description: "Analyzes user's HRV (Heart Rate Variability) trends over the past 7-14 days, including comparison periods, resting heart rate correlation, and recovery insights with actionable recommendations. This tool requires no input parameters - just call it to get the user's HRV analysis.",
    func: async () => {
      try {
        if (!userId) {
          return "I need you to be logged in to analyze your HRV trends. Please sign in to your account."
        }

        // Get user's Garmin connection
        const { data: connection, error: connError } = await (supabaseAdmin as any)
          .from('wearable_connections')
          .select('id')
          .eq('user_id', userId)
          .eq('wearable_type', 'garmin')
          .maybeSingle()

        if (connError || !connection) {
          return "I couldn't find your Garmin device connection. Please make sure your Garmin device is connected to get HRV insights."
        }

        const connectionId = connection.id
        const today = new Date()
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

        // Get HRV and RHR data for the past 14 days (for comparison)
        const { data: metricsData, error: dataError } = await (supabaseAdmin as any)
          .from('wearable_data')
          .select('value, timestamp, metric_type')
          .eq('connection_id', connectionId)
          .in('metric_type', ['hrv_rmssd', 'heart_rate_resting'])
          .gte('timestamp', fourteenDaysAgo.toISOString())
          .order('timestamp', { ascending: false })

        if (dataError || !metricsData || metricsData.length === 0) {
          return "I don't have enough HRV data from your Garmin device yet. Make sure your device is syncing sleep data regularly, as HRV is typically measured during sleep."
        }

        // Separate and process HRV and RHR data
        const hrvData: ProcessedDataPoint[] = metricsData
          .filter((d: WearableDataRecord) => d.metric_type === 'hrv_rmssd')
          .map((d: WearableDataRecord) => ({
            value: parseFloat(d.value),
            timestamp: new Date(d.timestamp)
          }))

        const rhrData: ProcessedDataPoint[] = metricsData
          .filter((d: WearableDataRecord) => d.metric_type === 'heart_rate_resting')
          .map((d: WearableDataRecord) => ({
            value: parseFloat(d.value),
            timestamp: new Date(d.timestamp)
          }))

        if (hrvData.length === 0) {
          return "No HRV data found in the past 14 days. HRV is measured during sleep, so make sure you're wearing your Garmin device at night."
        }

        // Split data into recent (last 7 days) vs comparison period (7-14 days ago)
        const recentHRV = hrvData.filter(d => d.timestamp >= sevenDaysAgo)
        const comparisonHRV = hrvData.filter(d => d.timestamp < sevenDaysAgo)
        
        const recentRHR = rhrData.filter(d => d.timestamp >= sevenDaysAgo)

        if (recentHRV.length === 0) {
          return "No recent HRV data found in the past 7 days. Make sure your Garmin device is syncing properly and you're wearing it during sleep."
        }

        // Calculate averages and trends
        const avgRecentHRV = Math.round(recentHRV.reduce((sum: number, d: ProcessedDataPoint) => sum + d.value, 0) / recentHRV.length)
        const avgComparisonHRV = comparisonHRV.length > 0 
          ? Math.round(comparisonHRV.reduce((sum: number, d: ProcessedDataPoint) => sum + d.value, 0) / comparisonHRV.length)
          : null

        const avgRecentRHR = recentRHR.length > 0 
          ? Math.round(recentRHR.reduce((sum: number, d: ProcessedDataPoint) => sum + d.value, 0) / recentRHR.length)
          : null

        // Trend analysis
        let trendMessage = ""
        let recoveryInsight = ""
        let recommendations: string[] = []

        if (avgComparisonHRV) {
          const percentChange = Math.round(((avgRecentHRV - avgComparisonHRV) / avgComparisonHRV) * 100)
          
          if (percentChange > 5) {
            trendMessage = `Your HRV has improved by ${percentChange}% compared to the previous week (${avgRecentHRV}ms vs ${avgComparisonHRV}ms).`
            recoveryInsight = "This improvement suggests your body is recovering well and adapting positively to your current routine."
            recommendations.push("Continue with your current sleep and recovery practices")
            recommendations.push("Consider gradually increasing training intensity if desired")
          } else if (percentChange < -5) {
            trendMessage = `Your HRV has declined by ${Math.abs(percentChange)}% compared to the previous week (${avgRecentHRV}ms vs ${avgComparisonHRV}ms).`
            recoveryInsight = "This decline may indicate accumulated stress, poor recovery, or early signs of overtraining."
            recommendations.push("Prioritize sleep quality and stress management")
            recommendations.push("Consider reducing training intensity for a few days")
            recommendations.push("Focus on relaxation techniques like deep breathing or meditation")
          } else {
            trendMessage = `Your HRV has remained stable around ${avgRecentHRV}ms over the past two weeks.`
            recoveryInsight = "Stable HRV indicates consistent recovery patterns, which is generally positive."
            recommendations.push("Maintain your current recovery routine")
          }
        } else {
          trendMessage = `Your current 7-day HRV average is ${avgRecentHRV}ms based on ${recentHRV.length} readings.`
          recoveryInsight = "I need more historical data to provide trend comparisons."
        }

        // HRV interpretation based on absolute values
        let hrvInterpretation = ""
        if (avgRecentHRV < 25) {
          hrvInterpretation = "Your HRV is on the lower side, which might indicate high stress levels or the need for more recovery."
        } else if (avgRecentHRV >= 25 && avgRecentHRV < 50) {
          hrvInterpretation = "Your HRV is in a moderate range, suggesting decent recovery capacity."
        } else if (avgRecentHRV >= 50) {
          hrvInterpretation = "Your HRV is in a good range, indicating strong recovery capacity and low stress levels."
        }

        // Add RHR correlation if available
        let rhrInsight = ""
        if (avgRecentRHR) {
          rhrInsight = ` Your resting heart rate has averaged ${avgRecentRHR} bpm recently.`
          if (avgRecentRHR > 70) {
            rhrInsight += " This is elevated, which often correlates with lower HRV and indicates your body may need more recovery."
            recommendations.push("Monitor for signs of overtraining or illness")
          } else if (avgRecentRHR < 50) {
            rhrInsight += " This low RHR combined with your HRV data suggests good cardiovascular fitness."
          }
        }

        // Compile the natural language response
        const response = `
## HRV Recovery Analysis

${trendMessage} ${hrvInterpretation}${rhrInsight}

**Recovery Insight:** ${recoveryInsight}

**What This Means:**
HRV (Heart Rate Variability) measures the variation in time between heartbeats and reflects your autonomic nervous system balance. Higher HRV generally indicates better recovery and stress resilience, while declining HRV can signal the need for more rest.

**Recommendations:**
${recommendations.map(rec => `• ${rec}`).join('\n')}

*Based on ${recentHRV.length} HRV readings over the past 7 days*
        `.trim()

        return response

      } catch (error) {
        console.error("Error analyzing HRV trend:", error)
        return "I encountered an error while analyzing your HRV data. This could be a temporary issue with data access. Please try again in a moment."
      }
    },
  })
}
