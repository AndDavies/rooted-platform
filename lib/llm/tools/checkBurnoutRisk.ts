import { DynamicTool } from "@langchain/core/tools"

export function checkBurnoutRiskTool(userId?: string) {
  return new DynamicTool({
    name: "checkBurnoutRisk",
    description: "Evaluates burnout risk by analyzing patterns in HRV, sleep quality, stress indicators, and recovery metrics to provide early warning signs and prevention strategies.",
    func: async () => {
      try {
        // TODO: Replace with vector-based search using pgvector when wellness content is embedded
        
        if (!userId) {
          return JSON.stringify({
            error: "User not authenticated",
            message: "Please log in to receive your burnout risk assessment."
          })
        }

        // Placeholder response - this will be replaced with analysis based on actual biometric data
        // and longitudinal patterns in HRV, sleep, stress, and recovery metrics
        const assessment = {
          overallRiskLevel: "Moderate",
          riskScore: 6.2, // Scale of 1-10, higher = more risk
          keyIndicators: {
            physiological: {
              hrvTrend: {
                status: "Declining",
                severity: "Moderate",
                details: "HRV has decreased 15% over the past 2 weeks",
                impact: "Medium"
              },
              sleepQuality: {
                status: "Compromised",
                severity: "Moderate",
                details: "Average sleep efficiency down to 82%, frequent night awakenings",
                impact: "High"
              },
              restingHeartRate: {
                status: "Elevated",
                severity: "Mild",
                details: "5 BPM increase from baseline over past week",
                impact: "Medium"
              },
              recoveryMetrics: {
                status: "Poor",
                severity: "High",
                details: "Consistently showing incomplete recovery between activities",
                impact: "High"
              }
            },
            behavioral: {
              energyLevels: "Consistently low, especially in afternoons",
              motivationChanges: "Decreased enthusiasm for usually enjoyable activities",
              cognitiveFunction: "Some difficulty with focus and decision-making",
              emotionalState: "Increased irritability and feeling overwhelmed"
            }
          },
          warningSignsPresent: [
            "Persistent fatigue despite adequate sleep duration",
            "Declining HRV trend over 2+ weeks",
            "Increased resting heart rate",
            "Difficulty feeling refreshed after sleep",
            "Reduced motivation for physical activity",
            "More reactive to daily stressors"
          ],
          protectiveFactorsPresent: [
            "Maintaining consistent sleep schedule",
            "Still engaging in some physical activity",
            "Aware of stress levels and seeking support",
            "Good social connections remain intact"
          ],
          immediateRecommendations: [
            {
              priority: "High",
              category: "Sleep Optimization",
              action: "Implement strict sleep hygiene for 1 week",
              details: "Fixed bedtime, cool dark room, no screens 1 hour before bed",
              expectedTimeframe: "3-7 days for improvement"
            },
            {
              priority: "High",
              category: "Stress Reduction",
              action: "Daily stress management practice",
              details: "15 minutes of meditation, breathwork, or gentle yoga",
              expectedTimeframe: "1-2 weeks for benefits"
            },
            {
              priority: "Medium",
              category: "Activity Modification",
              action: "Reduce training intensity by 20-30%",
              details: "Focus on gentle movement and recovery activities",
              expectedTimeframe: "Immediate implementation"
            },
            {
              priority: "Medium",
              category: "Nutrition Support",
              action: "Optimize meal timing and anti-inflammatory foods",
              details: "Regular meals, increase omega-3s, reduce processed foods",
              expectedTimeframe: "2-4 weeks for full benefits"
            }
          ],
          preventionStrategy: {
            daily: [
              "Check in with energy levels and mood each morning",
              "Practice 5-10 minutes of stress reduction",
              "Prioritize 7-9 hours of sleep",
              "Include some form of gentle movement"
            ],
            weekly: [
              "Review HRV and sleep trends",
              "Assess workload and make adjustments if needed",
              "Schedule restorative activities",
              "Connect with supportive people"
            ],
            monthly: [
              "Comprehensive review of stress sources",
              "Evaluate and adjust goals and commitments",
              "Plan recovery periods or breaks",
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
              "Thoughts of self-harm or excessive substance use",
              "Inability to function in work or personal relationships"
            ],
            action: "Contact healthcare provider or mental health professional"
          },
          recoveryTimeline: {
            week1: "Focus on sleep and immediate stress reduction",
            week2_4: "Gradual energy improvement and mood stabilization",
            month2_3: "Return to full activity levels and improved resilience",
            ongoing: "Maintain preventive practices and regular monitoring"
          },
          positivePrognosisFactors: [
            "Early recognition and intervention",
            "Strong social support system",
            "Previous successful stress management",
            "Good baseline health and fitness",
            "Willingness to make necessary changes"
          ]
        }

        return JSON.stringify(assessment)
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