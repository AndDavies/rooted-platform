import { DynamicTool } from "@langchain/core/tools"

export function recommendMindsetPracticeTool(userId?: string) {
  return new DynamicTool({
    name: "recommendMindsetPractice",
    description: "Recommends personalized mindset practices including journaling prompts, meditation techniques, clarity exercises, and mental wellness activities based on stress patterns and life circumstances.",
    func: async () => {
      try {
        // TODO: Replace with vector-based search using pgvector when wellness content is embedded
        
        if (!userId) {
          return JSON.stringify({
            error: "User not authenticated",
            message: "Please log in to receive personalized mindset practice recommendations."
          })
        }

        // Placeholder response - this will be replaced with personalized recommendations
        // based on stress patterns, mood tracking, and life circumstances
        const practices = {
          todaysFocus: {
            practice: "Gratitude & Reflection Journaling",
            timeRequired: "10-15 minutes",
            materials: "Journal or note-taking app",
            timing: "Evening, before winding down"
          },
          journalingPrompts: [
            {
              theme: "Gratitude",
              prompt: "What are three specific things that went well today, and why did they matter to you?",
              purpose: "Shift focus to positive experiences and build resilience"
            },
            {
              theme: "Growth",
              prompt: "What challenge did you face today, and what did it teach you about yourself?",
              purpose: "Reframe difficulties as learning opportunities"
            },
            {
              theme: "Clarity",
              prompt: "If you could change one thing about how you spent your energy today, what would it be?",
              purpose: "Increase self-awareness and intentional living"
            },
            {
              theme: "Connection",
              prompt: "How did you show up for others today, and how did others show up for you?",
              purpose: "Strengthen awareness of social connections and support"
            }
          ],
          meditationPractices: [
            {
              type: "Mindfulness Meditation",
              duration: "5-20 minutes",
              technique: "Focus on breath awareness",
              guidance: [
                "Sit comfortably with eyes closed or soft gaze",
                "Notice the natural rhythm of your breath",
                "When mind wanders, gently return to breath",
                "No judgment, just gentle awareness"
              ],
              benefits: "Reduces stress, improves focus, increases emotional regulation"
            },
            {
              type: "Body Scan",
              duration: "10-30 minutes",
              technique: "Progressive relaxation awareness",
              guidance: [
                "Lie down comfortably",
                "Start at toes, slowly move attention up body",
                "Notice sensations without trying to change them",
                "Release tension as you become aware of it"
              ],
              benefits: "Reduces physical tension, improves sleep, increases body awareness"
            },
            {
              type: "Loving-Kindness",
              duration: "10-15 minutes",
              technique: "Cultivate compassion and connection",
              guidance: [
                "Start with sending love to yourself",
                "Extend to loved ones, neutral people, difficult people",
                "Use phrases like 'May you be happy, may you be peaceful'",
                "Feel the warmth and connection"
              ],
              benefits: "Increases positive emotions, reduces self-criticism, improves relationships"
            }
          ],
          clarityExercises: [
            {
              name: "Values Check-in",
              description: "Identify if your actions align with your core values",
              timeRequired: "15 minutes",
              process: [
                "List your top 5 values",
                "Rate how well you honored each value this week (1-10)",
                "Identify one specific way to better align with your lowest-rated value",
                "Set an intention for tomorrow"
              ]
            },
            {
              name: "Energy Audit",
              description: "Understand what gives and drains your energy",
              timeRequired: "20 minutes",
              process: [
                "List activities from today in two columns: 'Energizing' and 'Draining'",
                "Rate the intensity of each (1-5)",
                "Look for patterns - what energizes you most?",
                "Plan to include more energizing activities tomorrow"
              ]
            }
          ],
          weeklyPractices: [
            {
              day: "Monday",
              focus: "Intention Setting",
              prompt: "What do I want to create or experience this week?"
            },
            {
              day: "Wednesday", 
              focus: "Mid-week Reflection",
              prompt: "How am I feeling about my progress? What needs adjustment?"
            },
            {
              day: "Friday",
              focus: "Weekly Review",
              prompt: "What did I learn about myself this week? What am I proud of?"
            },
            {
              day: "Sunday",
              focus: "Rest & Planning",
              prompt: "How can I honor both rest and preparation for the week ahead?"
            }
          ],
          mindfulnessReminders: [
            "Take three conscious breaths before checking your phone",
            "Practice gratitude during your morning routine",
            "Set hourly reminders to check in with your body and emotions",
            "End each day by naming one thing you did well"
          ]
        }

        return JSON.stringify(practices)
      } catch (error) {
        console.error("Error generating mindset practice recommendations:", error)
        return JSON.stringify({
          error: "Failed to generate mindset practices",
          message: "There was an error creating your mindset practice recommendations. Please try again later."
        })
      }
    },
  })
} 