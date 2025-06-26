import { DynamicTool } from "@langchain/core/tools"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface SleepRecord {
  value: string
  timestamp: string
  metric_type: string
}

export function analyzeDeepSleepTool(userId?: string) {
  return new DynamicTool({
    name: "analyzeDeepSleep",
    description: "Provides detailed analysis of deep sleep patterns, comparing user's deep sleep percentage to optimal ranges (15-23%), and offers specific evidence-based recommendations for improving deep sleep quality and duration.",
    func: async () => {
      try {
        if (!userId) {
          return "I need you to be logged in to analyze your deep sleep patterns. Please sign in to access your sleep analysis."
        }

        // Get user's Garmin connection
        const { data: connection, error: connError } = await (supabaseAdmin as any)
          .from('wearable_connections')
          .select('id')
          .eq('user_id', userId)
          .eq('wearable_type', 'garmin')
          .maybeSingle()

        if (connError || !connection) {
          return "I couldn't find your Garmin device connection. Please connect your Garmin device to analyze your deep sleep patterns."
        }

        const connectionId = connection.id
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

        // Get deep sleep and total sleep data for analysis
        const { data: sleepData, error: dataError } = await (supabaseAdmin as any)
          .from('wearable_data')
          .select('value, timestamp, metric_type')
          .eq('connection_id', connectionId)
          .in('metric_type', ['sleep_deep_seconds', 'sleep_total_seconds'])
          .gte('timestamp', fourteenDaysAgo.toISOString())
          .order('timestamp', { ascending: false })

        if (dataError || !sleepData || sleepData.length === 0) {
          return "I don't have enough sleep data to analyze your deep sleep patterns. Make sure your Garmin device is tracking sleep consistently by wearing it overnight."
        }

        // Group by date and calculate daily deep sleep percentages
        const sleepByDate: { [date: string]: { total?: number; deep?: number } } = {}
        
        sleepData.forEach((record: SleepRecord) => {
          const date = new Date(record.timestamp).toISOString().split('T')[0]
          if (!sleepByDate[date]) sleepByDate[date] = {}
          
          if (record.metric_type === 'sleep_total_seconds') {
            sleepByDate[date].total = parseFloat(record.value)
          } else if (record.metric_type === 'sleep_deep_seconds') {
            sleepByDate[date].deep = parseFloat(record.value)
          }
        })

        // Calculate daily deep sleep percentages
        const dailyDeepSleepData = Object.entries(sleepByDate)
          .filter(([, data]) => data.total && data.deep && data.total > 0)
          .map(([date, data]) => ({
            date,
            deepPercent: Math.round((data.deep! / data.total!) * 100),
            deepMinutes: Math.round(data.deep! / 60),
            totalHours: Math.round((data.total! / 3600) * 10) / 10
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (dailyDeepSleepData.length === 0) {
          return "No complete sleep data found for deep sleep analysis. Make sure you're wearing your Garmin device consistently during sleep."
        }

        // Split into recent vs older data
        const recentData = dailyDeepSleepData.slice(0, 7)
        const olderData = dailyDeepSleepData.slice(7, 14)

        // Calculate averages
        const avgDeepPercent = Math.round(recentData.reduce((sum, day) => sum + day.deepPercent, 0) / recentData.length)
        const avgDeepMinutes = Math.round(recentData.reduce((sum, day) => sum + day.deepMinutes, 0) / recentData.length)

        // Trend analysis
        let trendMessage = ""
        if (olderData.length > 0) {
          const oldAvgPercent = Math.round(olderData.reduce((sum, day) => sum + day.deepPercent, 0) / olderData.length)
          const percentChange = avgDeepPercent - oldAvgPercent
          
          if (Math.abs(percentChange) >= 2) {
            const direction = percentChange > 0 ? "improved" : "declined"
            trendMessage = `Your deep sleep percentage has ${direction} by ${Math.abs(percentChange)}% compared to the previous week. `
          } else {
            trendMessage = "Your deep sleep percentage has remained relatively stable over the past two weeks. "
          }
        }

        // Assess deep sleep quality
        let assessment = ""
        let recommendations: string[] = []
        let priority: string[] = []

        if (avgDeepPercent < 15) {
          assessment = "NEEDS IMPROVEMENT"
          recommendations.push("Your deep sleep is below the optimal 15-23% range, which may impact physical recovery and immune function")
          priority.push("🔴 HIGH PRIORITY: Focus on sleep environment optimization")
          priority.push("🔴 HIGH PRIORITY: Review caffeine intake timing (avoid after 2 PM)")
          priority.push("🔴 HIGH PRIORITY: Establish consistent sleep schedule")
        } else if (avgDeepPercent >= 15 && avgDeepPercent <= 23) {
          assessment = "OPTIMAL"
          recommendations.push("Your deep sleep percentage is in the healthy 15-23% range, supporting good physical recovery")
          priority.push("🟢 MAINTAIN: Continue your current sleep practices")
          priority.push("🟡 OPTIMIZE: Fine-tune environment for even better deep sleep")
        } else if (avgDeepPercent > 23) {
          assessment = "HIGHER THAN TYPICAL"
          recommendations.push("Your deep sleep percentage is above typical ranges, which often occurs during recovery periods")
          priority.push("🟡 MONITOR: This may indicate recovery from stress or training")
          priority.push("🟡 EVALUATE: Consider if you're getting adequate total sleep time")
        }

        // Evidence-based recommendations
        const evidenceBasedTips: string[] = []
        
        if (avgDeepPercent < 18) {
          evidenceBasedTips.push("**Temperature**: Keep bedroom between 65-68°F (18-20°C) as cooler temperatures promote deep sleep")
          evidenceBasedTips.push("**Light exposure**: Use blackout curtains or eye mask - even small amounts of light can disrupt deep sleep")
          evidenceBasedTips.push("**Magnesium**: Consider 200-400mg magnesium glycinate 30-60 minutes before bed to promote muscle relaxation")
          evidenceBasedTips.push("**Screen curfew**: Avoid screens 1-2 hours before bed as blue light suppresses melatonin production")
          evidenceBasedTips.push("**Alcohol timing**: Avoid alcohol within 3 hours of bedtime as it fragments sleep and reduces deep sleep")
        }
        
        if (avgDeepPercent < 20) {
          evidenceBasedTips.push("**Exercise timing**: Finish intensive exercise at least 4 hours before bed to allow core temperature to drop")
          evidenceBasedTips.push("**Stress management**: Practice meditation or progressive muscle relaxation to activate parasympathetic nervous system")
          evidenceBasedTips.push("**Bedroom noise**: Use earplugs or white noise to minimize sleep disruptions")
        }

        // Sleep consistency analysis
        const deepSleepVariability = Math.sqrt(
          recentData.reduce((sum, day) => {
            const diff = day.deepPercent - avgDeepPercent
            return sum + diff * diff
          }, 0) / recentData.length
        )

        let consistencyNote = ""
        if (deepSleepVariability > 5) {
          consistencyNote = "Your deep sleep varies significantly night to night, suggesting inconsistent sleep conditions or stress levels. "
          evidenceBasedTips.push("**Consistency**: Maintain the same bedtime and wake time, even on weekends, to regulate your circadian rhythm")
        }

        const response = `
## Deep Sleep Analysis (${recentData.length} nights)

**Status: ${assessment}** 
${trendMessage}${consistencyNote}

**Your Deep Sleep Metrics:**
• **Average Deep Sleep**: ${avgDeepPercent}% (${avgDeepMinutes} minutes)
• **Optimal Range**: 15-23% of total sleep  
• **Sleep Consistency**: ${deepSleepVariability <= 5 ? 'Good' : 'Variable'}

**Key Insights:**
${recommendations.map(rec => `• ${rec}`).join('\n')}

**Action Priorities:**
${priority.map(item => `${item}`).join('\n')}

**Evidence-Based Optimization Strategies:**
${evidenceBasedTips.map(tip => `• ${tip}`).join('\n')}

**Why Deep Sleep Matters:**
Deep sleep (also called slow-wave sleep) is when your body:
• Releases growth hormone for tissue repair and muscle growth  
• Consolidates memories from short-term to long-term storage
• Clears metabolic waste from the brain, including amyloid beta
• Strengthens immune system function and fights infection
• Regulates glucose metabolism and insulin sensitivity

*Based on ${recentData.length} nights of sleep data over the past ${Math.ceil(recentData.length * 7 / recentData.length)} days*
        `.trim()

        return response

      } catch (error) {
        console.error("Error analyzing deep sleep:", error)
        return "I encountered an error while analyzing your deep sleep data. This could be a temporary issue with data access. Please try again in a moment."
      }
    },
  })
} 