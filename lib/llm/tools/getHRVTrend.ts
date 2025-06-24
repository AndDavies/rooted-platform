// lib/llm/tools/getHRVTrend.ts
import { DynamicTool } from "@langchain/core/tools"
import { createClient } from "@/utils/supabase/server"

export function getHRVTrendTool(userId?: string) {
  return new DynamicTool({
    name: "getHRVTrend",
    description: "Returns a summary of the user's HRV trend over the past 7 days, including average values, trend direction, and recovery insights.",
    func: async (input: string) => {
      try {
        if (!userId) {
          return JSON.stringify({
            error: "User not authenticated",
            message: "Please log in to view your HRV trends."
          })
        }

        const supabase = await createClient()
        
        // Get user's Garmin connection
        const { data: connection } = await (supabase as any)
          .from('wearable_connections')
          .select('id')
          .eq('user_id', userId)
          .eq('wearable_type', 'garmin')
          .maybeSingle()

        if (!connection) {
          return JSON.stringify({
            error: "No device connected",
            message: "Please connect your Garmin device to view HRV trends."
          })
        }

        // Get HRV data from the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: hrvData } = await (supabase as any)
          .from('wearable_data')
          .select('value, timestamp')
          .eq('connection_id', connection.id)
          .eq('metric_type', 'hrv_rmssd')
          .gte('timestamp', sevenDaysAgo.toISOString())
          .order('timestamp', { ascending: false })

        if (!hrvData || hrvData.length === 0) {
          return JSON.stringify({
            error: "No HRV data found",
            message: "No HRV data available for the past 7 days. Make sure your device is syncing sleep data."
          })
        }

        // Calculate trends
        const values = hrvData.map((d: any) => parseFloat(d.value))
        const averageHRV = Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length)
        
        // Simple trend calculation (comparing first half vs second half)
        const midPoint = Math.floor(values.length / 2)
        const recentAvg = values.slice(0, midPoint).reduce((a: number, b: number) => a + b, 0) / midPoint
        const olderAvg = values.slice(midPoint).reduce((a: number, b: number) => a + b, 0) / (values.length - midPoint)
        
        let trend = "stable"
        let trendDirection = 0
        if (recentAvg > olderAvg * 1.05) {
          trend = "improving"
          trendDirection = Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
        } else if (recentAvg < olderAvg * 0.95) {
          trend = "declining"
          trendDirection = Math.round(((olderAvg - recentAvg) / olderAvg) * 100)
        }

        // Generate insights based on the data
        let insights = ""
        if (trend === "improving") {
          insights = `Your HRV has improved by ${trendDirection}% over the past week, indicating good recovery and lower stress levels. This suggests your body is adapting well to your current routine.`
        } else if (trend === "declining") {
          insights = `Your HRV has decreased by ${trendDirection}% over the past week, which may indicate increased stress, poor recovery, or overtraining. Consider prioritizing sleep and stress management.`
        } else {
          insights = "Your HRV has remained relatively stable over the past week, indicating consistent recovery patterns."
        }

        // Add context based on average HRV value
        if (averageHRV < 20) {
          insights += " Your average HRV is quite low, which may indicate high stress or fatigue."
        } else if (averageHRV > 50) {
          insights += " Your average HRV is in a good range, suggesting good cardiovascular health and recovery."
        }

        const result = {
          averageHRV,
          trend,
          trendDirection,
          dataPoints: hrvData.length,
          insights,
          recommendation: trend === "declining" 
            ? "Focus on sleep quality, stress reduction, and consider reducing training intensity."
            : "Continue with your current recovery practices."
        }

        return JSON.stringify(result)
      } catch (error) {
        console.error("Error fetching HRV trend:", error)
        return JSON.stringify({
          error: "Failed to fetch HRV data",
          message: "There was an error retrieving your HRV trends. Please try again later."
        })
      }
    },
  })
}
