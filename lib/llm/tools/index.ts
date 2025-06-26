// lib/llm/tools/index.ts
// Central export file for all LangChain wellness tools

// Existing tools (refactored)
import { getHRVTrendTool } from './getHRVTrend'
import { getSleepTrendTool } from './getSleepTrend'

// New data-driven analysis tools
import { getSleepTrendsTool } from './getSleepTrends'
import { getRecoveryInsightTool } from './getRecoveryInsight'
import { analyzeDeepSleepTool } from './analyzeDeepSleep'
import { explainMetricTool } from './explainMetric'

// New wellness-focused tools
import { recommendBreathworkTool } from './recommendBreathwork'
import { analyzeSleepRecoveryTool } from './analyzeSleepRecovery'
import { lookupSupplementsTool } from './lookupSupplements'
import { suggestActivityTool } from './suggestActivity'
import { recommendMindsetPracticeTool } from './recommendMindsetPractice'
import { suggestJoyfulActivityTool } from './suggestJoyfulActivity'
import { checkBurnoutRiskTool } from './checkBurnoutRisk'
import { generateRecoveryPlanTool } from './generateRecoveryPlan'

// RAG-powered tools
import { createSearchDocsTool } from './searchDocs'

// Re-export all tools
export {
  getHRVTrendTool,
  getSleepTrendTool,
  getSleepTrendsTool,
  getRecoveryInsightTool,
  analyzeDeepSleepTool,
  explainMetricTool,
  recommendBreathworkTool,
  analyzeSleepRecoveryTool,
  lookupSupplementsTool,
  suggestActivityTool,
  recommendMindsetPracticeTool,
  suggestJoyfulActivityTool,
  checkBurnoutRiskTool,
  generateRecoveryPlanTool,
  createSearchDocsTool,
}

// Utility function to get all tools for a user
export function getAllWellnessTools(userId?: string) {
  return [
    // Enhanced data-driven biometric analysis tools
    getHRVTrendTool(userId),
    getSleepTrendsTool(userId), // Enhanced version
    getRecoveryInsightTool(userId), // Comprehensive recovery scoring
    analyzeDeepSleepTool(userId), // Specialized deep sleep analysis
    explainMetricTool(userId), // Educational explanations
    
    // RAG-powered research tool
    createSearchDocsTool(userId),
    
    // Wellness and recovery tools
    recommendBreathworkTool(userId),
    analyzeSleepRecoveryTool(userId),
    lookupSupplementsTool(userId),
    suggestActivityTool(userId),
    recommendMindsetPracticeTool(userId),
    suggestJoyfulActivityTool(userId),
    checkBurnoutRiskTool(userId),
    generateRecoveryPlanTool(userId),
    
    // Keep original sleep tool for backward compatibility
    getSleepTrendTool(userId),
  ]
}

// Tool categories for easier management
export const TOOL_CATEGORIES = {
  BIOMETRIC_ANALYSIS: ['getHRVTrend', 'getSleepTrends', 'getRecoveryInsight', 'analyzeDeepSleep'],
  EDUCATION: ['explainMetric'],
  RESEARCH_RETRIEVAL: ['searchDocs'],
  STRESS_MANAGEMENT: ['recommendBreathwork', 'checkBurnoutRisk'],
  RECOVERY_OPTIMIZATION: ['analyzeSleepRecovery', 'generateRecoveryPlan'],
  ACTIVITY_GUIDANCE: ['suggestActivity', 'suggestJoyfulActivity'],
  MENTAL_WELLNESS: ['recommendMindsetPractice'],
  SUPPLEMENTATION: ['lookupSupplements'],
  LEGACY: ['getSleepTrend'], // Original tools kept for compatibility
} as const

export type ToolCategory = keyof typeof TOOL_CATEGORIES 