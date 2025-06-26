import { DynamicTool } from "@langchain/core/tools"

const metricExplanations: { [key: string]: string } = {
  'hrv_rmssd': `
## Heart Rate Variability (HRV) - RMSSD

**What it is:** HRV measures the variation in time between consecutive heartbeats. RMSSD specifically measures the root mean square of successive differences between heartbeats, typically measured in milliseconds.

**What it tells you:** 
• **Higher HRV (50+ ms)**: Indicates a healthy, resilient autonomic nervous system with good stress recovery
• **Lower HRV (below 25 ms)**: May suggest accumulated stress, fatigue, or reduced recovery capacity
• **Declining trend**: Often an early warning sign of overtraining, illness, or excessive stress

**Why it matters:** Your autonomic nervous system controls involuntary functions like heart rate, breathing, and digestion. When you're well-recovered and unstressed, your parasympathetic (rest and digest) system allows for more heart rate variation. Stress and fatigue reduce this variation.

**Best measured:** During sleep or upon waking, when external stressors are minimal.

**Factors that influence HRV:**
• Sleep quality and duration
• Training load and recovery
• Stress levels (physical and mental)
• Hydration status
• Alcohol consumption
• Age and fitness level
  `,

  'heart_rate_resting': `
## Resting Heart Rate (RHR)

**What it is:** The number of times your heart beats per minute when you're at complete rest, typically measured upon waking before getting out of bed.

**What it tells you:**
• **Lower RHR (50-60 bpm)**: Generally indicates good cardiovascular fitness
• **Higher RHR (70+ bpm)**: May suggest stress, dehydration, illness, or overtraining
• **Rising trend**: Often indicates accumulated fatigue or onset of illness

**Why it matters:** Your resting heart rate reflects how efficiently your heart pumps blood. A well-conditioned heart can pump more blood with each beat, so it doesn't need to beat as frequently.

**Normal ranges:**
• Athletes: 40-60 bpm
• Average adults: 60-100 bpm
• Elderly: Often slightly higher

**Factors that influence RHR:**
• Cardiovascular fitness level
• Training status and recovery
• Stress and sleep quality
• Dehydration or illness
• Caffeine and medications
• Environmental temperature
  `,

  'sleep_total_seconds': `
## Total Sleep Time

**What it is:** The total amount of time spent actually sleeping, excluding time spent awake in bed.

**What it tells you:**
• **7-9 hours**: Optimal for most adults
• **Less than 7 hours**: Associated with impaired cognitive function, weakened immunity, and poor recovery
• **More than 9 hours**: May indicate sleep debt recovery or underlying health issues

**Why it matters:** Sleep is when your body repairs tissues, consolidates memories, releases growth hormone, and resets your nervous system. Inadequate sleep impairs physical recovery, cognitive performance, and immune function.

**Sleep stages within total sleep:**
• **Light Sleep**: 50-60% of total sleep
• **Deep Sleep**: 15-23% of total sleep  
• **REM Sleep**: 20-25% of total sleep

**Factors affecting total sleep:**
• Sleep schedule consistency
• Sleep environment (temperature, light, noise)
• Stress and anxiety levels
• Caffeine and alcohol consumption
• Screen time before bed
• Physical activity timing
  `,

  'sleep_deep_seconds': `
## Deep Sleep (Slow-Wave Sleep)

**What it is:** The deepest stage of non-REM sleep, characterized by slow brain waves. Also called Stage 3 or slow-wave sleep.

**What it tells you:**
• **15-23% of total sleep**: Optimal range for most adults
• **Less than 15%**: May indicate poor sleep quality or disrupted sleep
• **More than 23%**: Often occurs during recovery from sleep debt or intense training

**Why it's crucial:** Deep sleep is when your body:
• Releases 95% of daily growth hormone for tissue repair
• Consolidates memories from short-term to long-term storage
• Clears metabolic waste from the brain (including amyloid beta)
• Strengthens immune system function
• Repairs muscles and bones

**Factors that improve deep sleep:**
• Cool bedroom temperature (65-68°F)
• Consistent sleep schedule
• Regular exercise (but not close to bedtime)
• Limiting alcohol and caffeine
• Managing stress levels
• Dark, quiet sleep environment

**What disrupts deep sleep:**
• Alcohol consumption
• Caffeine late in the day
• Stress and anxiety
• Inconsistent sleep schedule
• Warm sleeping environment
• Sleep disorders
  `,

  'sleep_rem_seconds': `
## REM Sleep (Rapid Eye Movement)

**What it is:** A unique sleep stage characterized by rapid eye movements, vivid dreams, and high brain activity. Your brain is almost as active as when awake.

**What it tells you:**
• **20-25% of total sleep**: Optimal range for adults
• **Less than 20%**: May indicate sleep fragmentation or alcohol interference
• **REM increases**: Throughout the night, with longest periods in early morning

**Why it's essential:** REM sleep is crucial for:
• Cognitive function and creativity
• Emotional processing and regulation
• Memory consolidation, especially procedural and emotional memories
• Brain development and neuroplasticity
• Mental health and mood regulation

**What affects REM sleep:**
• **Alcohol**: Significantly suppresses REM sleep
• **Antidepressants**: Many medications reduce REM
• **Sleep deprivation**: REM rebounds when you catch up on sleep
• **Stress**: High cortisol can reduce REM sleep
• **Age**: REM sleep decreases with age

**Signs of good REM sleep:**
• Feeling mentally refreshed upon waking
• Good mood and emotional regulation
• Clear thinking and creativity
• Vivid dream recall (though not remembering dreams is also normal)
  `,

  'stress_avg': `
## Stress Score

**What it is:** A composite metric that typically combines heart rate variability, heart rate patterns, and sometimes movement data to estimate your body's stress level throughout the day.

**What it tells you:**
• **0-25**: Low stress - good recovery state
• **26-50**: Moderate stress - manageable levels
• **51-75**: High stress - may impact recovery
• **76-100**: Very high stress - prioritize stress management

**Why it matters:** Chronic stress elevates cortisol, suppresses immune function, disrupts sleep, and impairs recovery. Monitoring stress helps you understand patterns and take action before burnout occurs.

**What influences stress scores:**
• Physical stressors (exercise, illness, poor sleep)
• Mental/emotional stress (work, relationships, anxiety)
• Environmental factors (noise, temperature)
• Caffeine and stimulants
• Dehydration
• Blood sugar fluctuations

**Managing high stress:**
• Deep breathing exercises
• Regular meditation or mindfulness
• Adequate sleep and recovery
• Moderate exercise (not intense when stressed)
• Social support and connection
• Time in nature
• Proper nutrition and hydration
  `,

  'respiration_rate': `
## Respiration Rate

**What it is:** The number of breaths you take per minute, typically measured during rest or sleep.

**What it tells you:**
• **12-20 breaths/min**: Normal for adults at rest
• **Below 12**: May indicate very relaxed state or trained respiratory efficiency
• **Above 20**: Could suggest stress, anxiety, illness, or poor fitness

**Why it matters:** Breathing rate reflects your metabolic state and stress level. Slower, deeper breathing activates the parasympathetic nervous system, promoting recovery and calm.

**What affects respiration rate:**
• Stress and anxiety levels
• Physical fitness
• Environmental temperature
• Altitude and air quality
• Illness or respiratory conditions
• Body position and activity level

**Optimizing breathing:**
• Practice diaphragmatic breathing
• Try box breathing (4-4-4-4 pattern)
• Breathwork exercises for stress management
• Maintain good posture for optimal lung capacity
• Regular cardiovascular exercise improves respiratory efficiency
  `
}

export function explainMetricTool(userId?: string) {
  return new DynamicTool({
    name: "explainMetric",
    description: "Provides detailed, scientific explanations of biometric metrics like HRV, sleep stages, heart rate, stress scores, and respiration rate. Input should be a metric name like 'HRV', 'deep sleep', 'resting heart rate', etc.",
    func: async (metricName: string) => {
      try {
        if (!metricName || metricName.trim().length === 0) {
          return "Please specify which metric you'd like me to explain. I can explain HRV, resting heart rate, sleep stages (deep sleep, REM sleep, total sleep), stress scores, respiration rate, and more."
        }

        // Normalize input to match our keys
        const normalizedMetric = metricName.toLowerCase().trim()
        
        // Map common variations to our standard keys
        const metricMappings: { [key: string]: string } = {
          'hrv': 'hrv_rmssd',
          'heart rate variability': 'hrv_rmssd',
          'rmssd': 'hrv_rmssd',
          'resting heart rate': 'heart_rate_resting',
          'rhr': 'heart_rate_resting',
          'resting hr': 'heart_rate_resting',
          'total sleep': 'sleep_total_seconds',
          'sleep duration': 'sleep_total_seconds',
          'sleep time': 'sleep_total_seconds',
          'deep sleep': 'sleep_deep_seconds',
          'slow wave sleep': 'sleep_deep_seconds',
          'stage 3 sleep': 'sleep_deep_seconds',
          'rem sleep': 'sleep_rem_seconds',
          'rem': 'sleep_rem_seconds',
          'rapid eye movement': 'sleep_rem_seconds',
          'stress': 'stress_avg',
          'stress score': 'stress_avg',
          'stress level': 'stress_avg',
          'breathing rate': 'respiration_rate',
          'respiration': 'respiration_rate',
          'respiratory rate': 'respiration_rate'
        }

        const mappedMetric = metricMappings[normalizedMetric]
        
        if (mappedMetric && metricExplanations[mappedMetric]) {
          return metricExplanations[mappedMetric].trim()
        }

        // If no exact match, provide a helpful list
        return `I don't have a specific explanation for "${metricName}". Here are the metrics I can explain in detail:

**Available Metric Explanations:**
• **HRV (Heart Rate Variability)** - Autonomic nervous system health and recovery
• **Resting Heart Rate** - Cardiovascular fitness and recovery status  
• **Total Sleep Time** - Sleep duration and its impact on health
• **Deep Sleep** - Physical recovery and memory consolidation
• **REM Sleep** - Cognitive function and emotional processing
• **Stress Score** - Body's stress level and recovery capacity
• **Respiration Rate** - Breathing patterns and relaxation state

Please ask about any of these specific metrics for a detailed explanation with scientific context and practical insights.`

      } catch (error) {
        console.error("Error explaining metric:", error)
        return "I encountered an error while retrieving the metric explanation. Please try again with a specific metric name like 'HRV' or 'deep sleep'."
      }
    },
  })
} 