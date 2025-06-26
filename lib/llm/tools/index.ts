// lib/llm/tools/index.ts
// Central export file for all LangChain wellness tools

// Existing tools
import { getHRVTrendTool } from './getHRVTrend'
import { getSleepTrendTool } from './getSleepTrend'

// New wellness-focused tools
import { recommendBreathworkTool } from './recommendBreathwork'
import { analyzeSleepRecoveryTool } from './analyzeSleepRecovery'
import { lookupSupplementsTool } from './lookupSupplements'
import { suggestActivityTool } from './suggestActivity'
import { recommendMindsetPracticeTool } from './recommendMindsetPractice'
import { suggestJoyfulActivityTool } from './suggestJoyfulActivity'
import { checkBurnoutRiskTool } from './checkBurnoutRisk'
import { generateRecoveryPlanTool } from './generateRecoveryPlan'

// Re-export all tools
export {
  getHRVTrendTool,
  getSleepTrendTool,
  recommendBreathworkTool,
  analyzeSleepRecoveryTool,
  lookupSupplementsTool,
  suggestActivityTool,
  recommendMindsetPracticeTool,
  suggestJoyfulActivityTool,
  checkBurnoutRiskTool,
  generateRecoveryPlanTool,
}

// Utility function to get all tools for a user
export function getAllWellnessTools(userId?: string) {
  return [
    // Existing biometric analysis tools
    getHRVTrendTool(userId),
    getSleepTrendTool(userId),
    
    // New wellness and recovery tools
    recommendBreathworkTool(userId),
    analyzeSleepRecoveryTool(userId),
    lookupSupplementsTool(userId),
    suggestActivityTool(userId),
    recommendMindsetPracticeTool(userId),
    suggestJoyfulActivityTool(userId),
    checkBurnoutRiskTool(userId),
    generateRecoveryPlanTool(userId),
  ]
}

// Tool categories for easier management
export const TOOL_CATEGORIES = {
  BIOMETRIC_ANALYSIS: ['getHRVTrend', 'getSleepTrend'],
  STRESS_MANAGEMENT: ['recommendBreathwork', 'checkBurnoutRisk'],
  RECOVERY_OPTIMIZATION: ['analyzeSleepRecovery', 'generateRecoveryPlan'],
  ACTIVITY_GUIDANCE: ['suggestActivity', 'suggestJoyfulActivity'],
  MENTAL_WELLNESS: ['recommendMindsetPractice'],
  SUPPLEMENTATION: ['lookupSupplements'],
} as const

export type ToolCategory = keyof typeof TOOL_CATEGORIES 