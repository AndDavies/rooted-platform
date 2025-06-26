#!/usr/bin/env tsx
/**
 * Test script to verify RAG integration with searchDocs tool
 * 
 * Usage:
 *   npx tsx lib/llm/test-rag.ts
 */

import { createSearchDocsTool } from './tools/searchDocs'
import { searchWellnessDocs } from './retriever'

async function testRAGIntegration() {
  console.log('🧪 Testing RAG Integration...\n')

  // Test 1: Direct retriever test
  console.log('📋 Test 1: Direct retriever test')
  try {
    const directResult = await searchWellnessDocs('supplements for nervous system recovery', 3)
    console.log('✅ Direct retriever test passed')
    console.log(`📄 Sample result: ${directResult.substring(0, 200)}...`)
  } catch (error) {
    console.log('❌ Direct retriever test failed:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 2: SearchDocs tool test
  console.log('🔧 Test 2: SearchDocs tool test')
  try {
    const searchTool = createSearchDocsTool('test-user-123')
    const toolResult = await searchTool.func('HRV and stress resilience research')
    console.log('✅ SearchDocs tool test passed')
    console.log(`🛠️  Tool result: ${toolResult.substring(0, 200)}...`)
  } catch (error) {
    console.log('❌ SearchDocs tool test failed:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 3: Tool configuration test
  console.log('⚙️  Test 3: Tool configuration test')
  try {
    const tool = createSearchDocsTool('test-user')
    console.log('✅ Tool creation successful')
    console.log(`🏷️  Tool name: ${tool.name}`)
    console.log(`📝 Tool description: ${tool.description.substring(0, 100)}...`)
  } catch (error) {
    console.log('❌ Tool configuration test failed:', error)
  }

  console.log('\n🎉 RAG Integration tests complete!')
}

// Run tests if this file is executed directly
if (require.main === module) {
  testRAGIntegration().catch(console.error)
}

export { testRAGIntegration } 