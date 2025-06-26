// lib/llm/test-tools.ts
// Simple test file to verify all wellness tools are working

import { getAllWellnessTools, TOOL_CATEGORIES } from './tools'

export async function testAllTools(userId = 'test-user') {
  console.log('🧪 Testing all wellness tools...')
  
  const tools = getAllWellnessTools(userId)
  
  console.log(`📋 Found ${tools.length} tools:`)
  tools.forEach(tool => console.log(`  - ${tool.name}: ${tool.description.substring(0, 80)}...`))
  
  console.log('\n🔧 Tool Categories:')
  Object.entries(TOOL_CATEGORIES).forEach(([category, toolNames]) => {
    console.log(`  ${category}: ${toolNames.join(', ')}`)
  })
  
  // Test one tool from each category
  const testResults = []
  
  try {
    console.log('\n🚀 Testing sample tools...')
    
    // Test breathwork recommendation
    const breathworkTool = tools.find(t => t.name === 'recommendBreathwork')
    if (breathworkTool) {
      const result = await breathworkTool.func('')
      const parsed = JSON.parse(result)
      testResults.push({
        tool: 'recommendBreathwork',
        success: !parsed.error,
        hasRecommendations: parsed.primaryTechnique?.name !== undefined
      })
    }
    
    // Test sleep analysis
    const sleepTool = tools.find(t => t.name === 'analyzeSleepRecovery')
    if (sleepTool) {
      const result = await sleepTool.func('')
      const parsed = JSON.parse(result)
      testResults.push({
        tool: 'analyzeSleepRecovery',
        success: !parsed.error,
        hasAnalysis: parsed.recoveryScore !== undefined
      })
    }
    
    // Test burnout assessment
    const burnoutTool = tools.find(t => t.name === 'checkBurnoutRisk')
    if (burnoutTool) {
      const result = await burnoutTool.func('')
      const parsed = JSON.parse(result)
      testResults.push({
        tool: 'checkBurnoutRisk',
        success: !parsed.error,
        hasAssessment: parsed.overallRiskLevel !== undefined
      })
    }
    
    console.log('\n✅ Test Results:')
    testResults.forEach(result => {
      console.log(`  ${result.tool}: ${result.success ? '✅ PASS' : '❌ FAIL'}`)
    })
    
    const allPassed = testResults.every(r => r.success)
    console.log(`\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
    
    return allPassed
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
    return false
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAllTools().then(success => {
    process.exit(success ? 0 : 1)
  })
} 