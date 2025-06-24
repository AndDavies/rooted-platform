import { DynamicTool } from "@langchain/core/tools"
import { createClient } from "@/utils/supabase/server"

export function getSleepTrendTool(userId?: string) {
  return new DynamicTool({
    name: "getSleepTrend",
    description: "Returns a summary of the user's sleep patterns over the past 7 days, including total sleep time, sleep efficiency, and sleep stage analysis.",
    func: async (input: string) => {
      try {
        if (!userId) {
          return JSON.stringify({
            error: "User not authenticated",
            message: "Please log in to view your sleep trends."
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
            message: "Please connect your Garmin device to view sleep trends."
          })
        }

        // Get sleep data from the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: sleepData } = await (supabase as any)
          .from('wearable_data')
          .select('value, timestamp, metric_type')
          .eq('connection_id', connection.id)
          .in('metric_type', ['sleep_total_seconds', 'sleep_deep_seconds', 'sleep_rem_seconds'])
          .gte('timestamp', sevenDaysAgo.toISOString())
          .order('timestamp', { ascending: false })

        if (!sleepData || sleepData.length === 0) {
          return JSON.stringify({
            error: "No sleep data found",
            message: "No sleep data available for the past 7 days. Make sure your device is tracking sleep."
          })
        }

        // Group by date and metric type
        const sleepByDate: { [date: string]: { [metric: string]: number } } = {}
        
        sleepData.forEach((record: any) => {
          const date = new Date(record.timestamp).toISOString().split('T')[0]
          if (!sleepByDate[date]) {
            sleepByDate[date] = {}
          }
          sleepByDate[date][record.metric_type] = parseFloat(record.value)
        })

        const dates = Object.keys(sleepByDate)
        if (dates.length === 0) {
          return JSON.stringify({
            error: "No sleep data found",
            message: "No sleep data available for analysis."
          })
        }

        // Calculate averages
        let totalSleepSeconds = 0
        let totalDeepSeconds = 0
        let totalRemSeconds = 0
        let validNights = 0

        dates.forEach(date => {
          const dayData = sleepByDate[date]
          if (dayData.sleep_total_seconds) {
            totalSleepSeconds += dayData.sleep_total_seconds
            totalDeepSeconds += dayData.sleep_deep_seconds || 0
            totalRemSeconds += dayData.sleep_rem_seconds || 0
            validNights++
          }
        })

        if (validNights === 0) {
          return JSON.stringify({
            error: "Insufficient sleep data",
            message: "Not enough valid sleep data for analysis."
          })
        }

        const avgTotalHours = Math.round((totalSleepSeconds / validNights / 3600) * 10) / 10
        const avgDeepPercent = Math.round((totalDeepSeconds / totalSleepSeconds) * 100)
        const avgRemPercent = Math.round((totalRemSeconds / totalSleepSeconds) * 100)

        // Generate insights
        let insights = ""
        let recommendations = []

        if (avgTotalHours < 7) {
          insights = `Your average sleep duration of ${avgTotalHours} hours is below the recommended 7-9 hours. This may impact your recovery and performance.`
          recommendations.push("Aim to go to bed 30-60 minutes earlier to increase total sleep time.")
        } else if (avgTotalHours >= 7 && avgTotalHours <= 9) {
          insights = `Your average sleep duration of ${avgTotalHours} hours is within the healthy range of 7-9 hours.`
          recommendations.push("Maintain your current sleep schedule as the duration is optimal.")
        } else {
          insights = `Your average sleep duration of ${avgTotalHours} hours is above 9 hours. While not necessarily harmful, consider if you feel refreshed upon waking.`
        }

        // Deep sleep analysis
        if (avgDeepPercent < 15) {
          insights += ` Your deep sleep percentage (${avgDeepPercent}%) is below optimal levels (15-20%).`
          recommendations.push("Focus on sleep hygiene: keep your room cool, dark, and avoid screens before bed.")
        } else if (avgDeepPercent >= 15 && avgDeepPercent <= 20) {
          insights += ` Your deep sleep percentage (${avgDeepPercent}%) is in the optimal range.`
        }

        // REM sleep analysis
        if (avgRemPercent < 20) {
          insights += ` Your REM sleep percentage (${avgRemPercent}%) could be improved (optimal: 20-25%).`
          recommendations.push("Reduce alcohol consumption and maintain consistent sleep times to improve REM sleep.")
        } else if (avgRemPercent >= 20) {
          insights += ` Your REM sleep percentage (${avgRemPercent}%) is good.`
        }

        const result = {
          averageSleepHours: avgTotalHours,
          deepSleepPercent: avgDeepPercent,
          remSleepPercent: avgRemPercent,
          nightsCounted: validNights,
          insights,
          recommendations: recommendations.length > 0 ? recommendations : ["Continue with your current sleep practices."]
        }

        return JSON.stringify(result)
      } catch (error) {
        console.error("Error fetching sleep trend:", error)
        return JSON.stringify({
          error: "Failed to fetch sleep data",
          message: "There was an error retrieving your sleep trends. Please try again later."
        })
      }
    },
  })
} 