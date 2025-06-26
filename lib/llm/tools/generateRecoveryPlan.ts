import { DynamicTool } from "@langchain/core/tools"

export function generateRecoveryPlanTool(userId?: string) {
  return new DynamicTool({
    name: "generateRecoveryPlan",
    description: "Generates a comprehensive multi-day recovery protocol using biometric data analysis, incorporating sleep optimization, stress management, nutrition, movement, and lifestyle modifications.",
    func: async () => {
      try {
        // TODO: Replace with vector-based search using pgvector when wellness content is embedded
        
        if (!userId) {
          return JSON.stringify({
            error: "User not authenticated",
            message: "Please log in to receive your personalized recovery plan."
          })
        }

        // Placeholder response - this will be replaced with personalized plans
        // based on HRV trends, sleep data, stress levels, and recovery needs
        const plan = {
          planDuration: "7 days",
          planType: "Stress Recovery & HRV Optimization",
          currentStatus: {
            hrvBaseline: 38,
            recentTrend: "Declining (-12% over 2 weeks)",
            sleepQuality: "Below optimal (78% efficiency)",
            stressLevel: "Elevated",
            recoveryState: "Incomplete"
          },
          goals: [
            "Improve HRV by 15-20% within 7 days",
            "Increase sleep efficiency to 85%+",
            "Reduce perceived stress levels",
            "Restore energy and motivation",
            "Establish sustainable recovery practices"
          ],
          dailyProtocol: {
            day1: {
              theme: "Foundation & Assessment",
              morning: {
                time: "6:30-8:00 AM",
                activities: [
                  "HRV measurement (5 min)",
                  "Gentle sun exposure (10-15 min)",
                  "Hydration (16-20 oz water)",
                  "Light stretching or yoga (10 min)",
                  "Nutritious breakfast with protein"
                ]
              },
              midday: {
                time: "12:00-2:00 PM",
                activities: [
                  "Balanced lunch with anti-inflammatory foods",
                  "Short walk outdoors (15-20 min)",
                  "Breathing exercise (5 min)",
                  "Limit caffeine after 2 PM"
                ]
              },
              evening: {
                time: "7:00-10:00 PM",
                activities: [
                  "Light dinner 3 hours before bed",
                  "Digital sunset (no screens 1 hour before bed)",
                  "Magnesium supplement (200mg)",
                  "Gentle stretching or meditation (10-15 min)",
                  "Cool, dark sleep environment (65-68°F)"
                ]
              },
              notes: "Focus on establishing baseline routines. Track sleep quality and morning HRV."
            },
            day2_3: {
              theme: "Stress Reduction & Sleep Optimization",
              focus: [
                "Implement consistent wake/sleep times",
                "Add 20 minutes daily breathwork practice",
                "Begin cold therapy (cold shower 2-3 min)",
                "Increase omega-3 rich foods",
                "Practice saying 'no' to non-essential commitments"
              ],
              newAdditions: [
                "Box breathing before meals (4-4-4-4 pattern)",
                "Evening journaling (5-10 min)",
                "Ashwagandha supplement (300mg evening)"
              ]
            },
            day4_5: {
              theme: "Active Recovery & Nervous System Reset",
              focus: [
                "Gentle movement (yoga, walking, swimming)",
                "Increase social connection",
                "Nature exposure (30+ min daily)",
                "Mindfulness during daily activities",
                "Optimize meal timing (12-hour eating window)"
              ],
              progressMarkers: [
                "HRV should show stabilization or slight improvement",
                "Sleep onset time decreasing",
                "Energy levels more stable throughout day"
              ]
            },
            day6_7: {
              theme: "Integration & Future Planning",
              focus: [
                "Assess progress and adjust protocols",
                "Plan sustainable long-term practices",
                "Gradually reintroduce normal activities",
                "Identify triggers and prevention strategies",
                "Celebrate improvements and progress"
              ],
              evaluation: [
                "Compare week 1 vs baseline HRV",
                "Review sleep efficiency improvements",
                "Assess subjective energy and mood",
                "Plan maintenance protocol"
              ]
            }
          },
          supplementProtocol: {
            essential: [
              {
                supplement: "Magnesium Glycinate",
                dosage: "200-300mg",
                timing: "Evening with dinner",
                purpose: "Sleep quality and nervous system relaxation"
              },
              {
                supplement: "Omega-3 (EPA/DHA)",
                dosage: "1000-2000mg",
                timing: "With largest meal",
                purpose: "Anti-inflammatory support and recovery"
              }
            ],
            targeted: [
              {
                supplement: "Ashwagandha",
                dosage: "300-500mg",
                timing: "Evening",
                purpose: "Cortisol regulation and stress adaptation",
                duration: "Start day 2, continue for 4 weeks"
              },
              {
                supplement: "L-Theanine",
                dosage: "100-200mg",
                timing: "As needed for stress",
                purpose: "Calm alertness without sedation"
              }
            ]
          },
          nutritionGuidelines: {
            emphasize: [
              "Anti-inflammatory foods (berries, leafy greens, fatty fish)",
              "High-quality proteins at each meal",
              "Complex carbohydrates for steady energy",
              "Adequate hydration (half body weight in ounces)",
              "Prebiotic and probiotic foods for gut health"
            ],
            minimize: [
              "Processed and ultra-processed foods",
              "Excessive caffeine (limit to morning only)",
              "Alcohol during recovery period",
              "High-sugar foods and beverages",
              "Large meals close to bedtime"
            ],
            timing: [
              "Eat within 1 hour of waking",
              "Balanced meals every 3-4 hours",
              "Largest meal at lunch when possible",
              "Light dinner 3+ hours before bed",
              "Consider 12-hour eating window"
            ]
          },
          movementPrescription: {
            week1: [
              "Gentle yoga or stretching (15-30 min daily)",
              "Walking at comfortable pace (20-45 min)",
              "Breathwork and meditation (10-20 min)",
              "NO high-intensity exercise",
              "Focus on mobility and nervous system recovery"
            ],
            progressionGuidelines: [
              "Listen to body signals over prescribed plans",
              "Morning HRV should guide intensity decisions",
              "If HRV drops, reduce activity intensity",
              "Prioritize consistency over intensity",
              "Sleep quality more important than exercise completion"
            ]
          },
          trackingMetrics: {
            daily: [
              "Morning HRV measurement",
              "Sleep quality rating (1-10)",
              "Energy level throughout day (1-10)",
              "Stress perception (1-10)",
              "Mood and motivation (1-10)"
            ],
            weekly: [
              "Average HRV trend",
              "Sleep efficiency percentage",
              "Exercise tolerance and recovery",
              "Overall well-being assessment",
              "Plan adherence and challenges"
            ]
          },
          troubleshooting: {
            "If HRV continues declining": [
              "Reduce all stressors further",
              "Increase sleep duration",
              "Consider professional stress counseling",
              "Check for underlying health issues"
            ],
            "If sleep doesn't improve": [
              "Evaluate sleep environment thoroughly",
              "Consider sleep study if persistent",
              "Review medications with healthcare provider",
              "Try different relaxation techniques"
            ],
            "If energy remains low": [
              "Check iron, B12, vitamin D levels",
              "Assess thyroid function",
              "Review caloric intake adequacy",
              "Consider adrenal fatigue evaluation"
            ]
          },
          maintenancePhase: {
            description: "Protocol for weeks 2-4 and beyond",
            modifications: [
              "Gradually reintroduce normal activities",
              "Maintain core sleep and stress practices",
              "Monitor HRV trends weekly rather than daily",
              "Use HRV to guide training intensity",
              "Schedule regular recovery weeks"
            ]
          }
        }

        return JSON.stringify(plan)
      } catch (error) {
        console.error("Error generating recovery plan:", error)
        return JSON.stringify({
          error: "Failed to generate recovery plan",
          message: "There was an error creating your recovery plan. Please try again later."
        })
      }
    },
  })
} 