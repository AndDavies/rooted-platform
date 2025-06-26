import { DynamicTool } from "@langchain/core/tools"

export function suggestJoyfulActivityTool(userId?: string) {
  return new DynamicTool({
    name: "suggestJoyfulActivity",
    description: "Suggests personalized mood-boosting and emotionally uplifting activities designed to increase joy, playfulness, creativity, and positive emotions based on user preferences and current emotional state.",
    func: async () => {
      try {
        // TODO: Replace with vector-based search using pgvector when wellness content is embedded
        
        if (!userId) {
          return JSON.stringify({
            error: "User not authenticated",
            message: "Please log in to receive personalized joyful activity suggestions."
          })
        }

        // Placeholder response - this will be replaced with personalized recommendations
        // based on mood patterns, preferences, available time, and seasonal factors
        const currentSeason = getCurrentSeason()
        const currentTime = new Date().getHours()
        
        const suggestions = {
          quickJoyBoosts: [
            {
              activity: "Dance to Your Favorite Song",
              duration: "3-5 minutes",
              materials: "Just your body and music",
              benefits: "Instant mood lift, endorphin release, stress relief",
              tip: "Choose a song that makes you smile or reminds you of a happy memory"
            },
            {
              activity: "Call Someone Who Makes You Laugh",
              duration: "5-15 minutes",
              materials: "Phone",
              benefits: "Social connection, shared joy, perspective shift",
              tip: "Think of the person who always cheers you up"
            },
            {
              activity: "Look at Photos of Happy Memories",
              duration: "5-10 minutes",
              materials: "Photo album or phone",
              benefits: "Nostalgia boost, gratitude activation, mood elevation",
              tip: "Focus on photos where you're genuinely smiling or laughing"
            }
          ],
          creativeExpressions: [
            {
              activity: "Freeform Drawing or Doodling",
              duration: "15-30 minutes",
              materials: "Paper and any drawing tool",
              approach: "No goals, just let your hand move freely",
              benefits: "Mindfulness, self-expression, mental relaxation"
            },
            {
              activity: "Write a Letter to Future You",
              duration: "20-30 minutes",
              materials: "Paper or digital document",
              approach: "Share your current hopes, dreams, and encouragement",
              benefits: "Hope cultivation, self-compassion, goal clarification"
            },
            {
              activity: "Create a Gratitude Collage",
              duration: "30-60 minutes",
              materials: "Magazines, scissors, glue, poster board",
              approach: "Cut out images that represent things you're grateful for",
              benefits: "Visual gratitude practice, creative flow, positive focus"
            }
          ],
          natureConnections: [
            {
              activity: "Outdoor Mindful Walking",
              duration: "20-45 minutes",
              focus: "Notice colors, sounds, textures, and smells",
              benefits: "Nature therapy, vitamin D, grounding, perspective",
              seasonal: getSeasonalNatureActivity(currentSeason)
            },
            {
              activity: "Garden or Tend Plants",
              duration: "15-45 minutes",
              options: ["Water houseplants mindfully", "Plant seeds", "Arrange flowers"],
              benefits: "Nurturing practice, connection to growth cycles, accomplishment"
            }
          ],
          playfulActivities: [
            {
              activity: "Try a New Recipe",
              duration: "45-90 minutes",
              approach: "Choose something fun and colorful",
              benefits: "Sensory engagement, creativity, nourishment",
              tip: "Focus on the process, not perfection"
            },
            {
              activity: "Have a Solo Dance Party",
              duration: "10-30 minutes",
              setup: "Create a playlist of songs that make you move",
              benefits: "Physical activity, emotional release, self-celebration",
              tip: "Close the curtains and dance like nobody's watching"
            },
            {
              activity: "Build Something Simple",
              duration: "30-90 minutes",
              options: ["Origami", "Lego creation", "Craft project"],
              benefits: "Focus flow, accomplishment, hands-on satisfaction"
            }
          ],
          socialJoyActivities: [
            {
              activity: "Send Surprise Messages of Appreciation",
              duration: "15-30 minutes",
              approach: "Text or email people who've positively impacted you",
              benefits: "Spreads joy to others, strengthens relationships, gratitude practice"
            },
            {
              activity: "Plan a Future Adventure",
              duration: "30-60 minutes",
              approach: "Research and daydream about a trip or experience",
              benefits: "Hope and anticipation, goal setting, mental escape"
            }
          ],
          timeBasedSuggestions: {
            morning: currentTime < 12 ? [
              "Energizing activities to start the day positively",
              "Outdoor activities for natural light exposure",
              "Creative practices to spark inspiration"
            ] : null,
            afternoon: currentTime >= 12 && currentTime < 18 ? [
              "Social connections and relationship nurturing",
              "Physical activities for energy boost",
              "Productive creative projects"
            ] : null,
            evening: currentTime >= 18 ? [
              "Gentle, soothing joyful activities",
              "Reflection and gratitude practices",
              "Cozy creative pursuits"
            ] : null
          },
          personalizedTips: [
            "Notice what types of activities consistently boost your mood",
            "Keep a 'joy list' for days when you can't think of what to do",
            "Remember that small moments of joy are just as valuable as big ones",
            "Don't judge your choices - what brings you joy is valid",
            "Consider combining activities (like listening to music while creating art)"
          ]
        }

        return JSON.stringify(suggestions)
      } catch (error) {
        console.error("Error generating joyful activity suggestions:", error)
        return JSON.stringify({
          error: "Failed to generate joyful activities",
          message: "There was an error creating your joyful activity suggestions. Please try again later."
        })
      }
    },
  })
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return "spring"
  if (month >= 5 && month <= 7) return "summer"
  if (month >= 8 && month <= 10) return "fall"
  return "winter"
}

function getSeasonalNatureActivity(season: string): string {
  const activities = {
    spring: "Notice new growth, blooming flowers, and returning wildlife",
    summer: "Feel the warmth, find shade patterns, listen to summer sounds",
    fall: "Observe changing colors, collect interesting leaves, feel crisp air",
    winter: "Notice winter light, frost patterns, bare tree beauty"
  }
  return activities[season as keyof typeof activities] || activities.spring
} 