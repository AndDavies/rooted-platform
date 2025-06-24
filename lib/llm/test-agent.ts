// lib/llm/test-agent.ts
// This is a test file to validate the agent works
// You can run this to test the agent functionality

import { runRecoveryAgentForAPI } from './agent'

/**
 * Test function to verify the AI integration is working properly
 * This can be called from a test route or during development
 */
export async function testRecoveryAgent(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  console.log('[Test] Starting AI agent test...')
  
  try {
    // Test basic functionality without user-specific data
    const testMessage = "Hi, I'm testing if you're working properly. Can you introduce yourself briefly?"
    
    const response = await runRecoveryAgentForAPI(
      testMessage,
      undefined, // No user ID for basic test
      undefined, // No chat history
      undefined, // No user profile
      undefined  // No widget context
    )

    if (response.success) {
      console.log('[Test] ✅ AI agent test passed!')
      console.log(`[Test] Response length: ${response.response.length} characters`)
      console.log(`[Test] Duration: ${response.metadata?.duration}ms`)
      
      return {
        success: true,
        message: 'AI agent is working properly',
        details: {
          responseLength: response.response.length,
          duration: response.metadata?.duration,
          toolsUsed: response.metadata?.toolsUsed || [],
          modelUsed: response.metadata?.modelUsed,
          response: response.response.substring(0, 200) + '...'
        }
      }
    } else {
      console.log('[Test] ❌ AI agent test failed')
      console.log(`[Test] Error: ${response.error}`)
      
      return {
        success: false,
        message: 'AI agent test failed',
        details: {
          error: response.error,
          duration: response.metadata?.duration
        }
      }
    }
  } catch (error) {
    console.error('[Test] ❌ AI agent test crashed:', error)
    
    return {
      success: false,
      message: 'AI agent test crashed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
  }
}

/**
 * Test function with biometric tools (requires user with Garmin data)
 */
export async function testRecoveryAgentWithBiometrics(userId: string): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  console.log(`[Test] Starting biometric AI test for user: ${userId}`)
  
  try {
    const testMessage = "Can you analyze my recent HRV and sleep trends and give me recovery recommendations?"
    
    const response = await runRecoveryAgentForAPI(
      testMessage,
      userId,
      undefined,
      { name: 'Test User', timezone: 'UTC', device: 'Garmin' },
      undefined
    )

    if (response.success) {
      console.log('[Test] ✅ Biometric AI test passed!')
      console.log(`[Test] Tools used: ${response.metadata?.toolsUsed?.join(', ') || 'none'}`)
      
      return {
        success: true,
        message: 'Biometric AI test passed',
        details: {
          responseLength: response.response.length,
          duration: response.metadata?.duration,
          toolsUsed: response.metadata?.toolsUsed || [],
          response: response.response.substring(0, 300) + '...'
        }
      }
    } else {
      return {
        success: false,
        message: 'Biometric AI test failed',
        details: {
          error: response.error,
          duration: response.metadata?.duration
        }
      }
    }
  } catch (error) {
    console.error('[Test] ❌ Biometric AI test crashed:', error)
    
    return {
      success: false,
      message: 'Biometric AI test crashed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Uncomment to run test (make sure OPENAI_API_KEY is set)
// testRecoveryAgent() 