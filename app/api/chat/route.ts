import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { runRecoveryAgentForAPI } from '@/lib/llm/agent'
import { headers } from 'next/headers'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Validate and sanitize input
function validateInput(message: string): { isValid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message is required and must be a string' }
  }
  
  if (message.length > 4000) {
    return { isValid: false, error: 'Message too long (max 4000 characters)' }
  }
  
  if (message.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' }
  }
  
  return { isValid: true }
}

// Rate limiting function
function checkRateLimit(identifier: string): { allowed: boolean; error?: string } {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 20 // 20 requests per 15 minutes
  
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }
  
  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      error: `Rate limit exceeded. Try again in ${Math.ceil((record.resetTime - now) / 1000 / 60)} minutes.` 
    }
  }
  
  record.count++
  return { allowed: true }
}

// Define the context type
interface UserContext {
  userProfile: any
  recentMessages: any[]
  wearableConnection: any
  widgetContext?: any
}

// Load user context and preferences
async function loadUserContext(userId: string, supabase: any): Promise<UserContext> {
  try {
    // Get user profile and AI preferences
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name, ai_preferences, recovery_goals, health_profile, timezone')
      .eq('id', userId)
      .single()

    // Get recent chat history (last 10 messages for context)
    const { data: recentMessages } = await (supabase as any)
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get wearable connection status
    const { data: wearableConnection } = await supabase
      .from('wearable_connections')
      .select('wearable_type, created_at')
      .eq('user_id', userId)
      .maybeSingle()

    // TODO: Future - Load relevant vector context for RAG
    // const { data: vectorContext } = await (supabase as any)
    //   .from('user_vector_context')
    //   .select('content, metadata')
    //   .eq('user_id', userId)
    //   .limit(5)

    return {
      userProfile: userProfile || {},
      recentMessages: recentMessages || [],
      wearableConnection,
      // vectorContext: vectorContext || []
    }
  } catch (error) {
    console.error('Error loading user context:', error)
    return {
      userProfile: {},
      recentMessages: [],
      wearableConnection: null,
      // vectorContext: []
    }
  }
}

// Route to appropriate agent based on mode
async function routeToAgent(
  message: string, 
  userId: string, 
  mode: string, 
  context: UserContext
): Promise<{ success: boolean; response: string; error: string | null; metadata?: any }> {
  
  const startTime = Date.now()
  console.log(`[API] Routing to agent - Mode: ${mode}, User: ${userId}`)
  
  // Build conversation history for context
  const chatHistory = context.recentMessages
    .reverse() // Reverse to chronological order
    .map((msg: any) => `${msg.role}: ${msg.content}`)
    .join('\n')

  // Add user context to the message for better personalization
  const userProfile = {
    name: context.userProfile.full_name || 'User',
    timezone: context.userProfile.timezone || 'UTC',
    device: context.wearableConnection?.wearable_type || 'None connected',
    preferences: context.userProfile.ai_preferences || {},
    goals: context.userProfile.recovery_goals || {},
    healthProfile: context.userProfile.health_profile || {}
  }

  try {
    switch (mode) {
      case 'recovery':
      case 'wellness':
      default:
        const agentResponse = await runRecoveryAgentForAPI(
          message,
          userId,
          chatHistory,
          userProfile,
          context.widgetContext
        )
        
        const duration = Date.now() - startTime
        console.log(`[API] Agent completed in ${duration}ms - Success: ${agentResponse.success}`)
        
        if (agentResponse.metadata) {
          agentResponse.metadata.apiDuration = duration
        }
        
        return agentResponse
      
      // TODO: Future agent types
      // case 'nutrition':
      //   return await runNutritionAgent(contextualMessage, userId, chatHistory)
      // case 'insight':
      //   return await runInsightAgent(contextualMessage, userId, chatHistory)
      // case 'planning':
      //   return await runPlanningAgent(contextualMessage, userId, chatHistory)
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[API] Agent routing failed after ${duration}ms:`, error)
    
    return {
      success: false,
      response: "I'm experiencing technical difficulties. Please try again in a moment.",
      error: error instanceof Error ? error.message : "Unknown routing error",
      metadata: {
        apiDuration: duration,
        routingError: true
      }
    }
  }
}

// Save conversation to database with enhanced metadata
async function saveConversation(
  userId: string,
  sessionId: string | null,
  userMessage: string,
  agentResponse: string,
  mode: string,
  metadata: any,
  supabase: any
) {
  const startTime = Date.now()
  
  try {
    let actualSessionId = sessionId

    // Create new session if none provided
    if (!actualSessionId) {
      const { data: newSession, error: sessionError } = await (supabase as any)
        .from('chat_sessions')
        .insert({
          user_id: userId,
          agent_type: mode,
          title: userMessage.substring(0, 50) + '...',
          context: { 
            mode,
            initialMetadata: metadata
          }
        })
        .select('id')
        .single()

      if (sessionError) {
        console.error('[API] Error creating chat session:', sessionError)
        return
      }
      
      actualSessionId = newSession.id
    }

    const now = new Date().toISOString()

    // Save user message
    await (supabase as any).from('chat_messages').insert({
      session_id: actualSessionId,
      user_id: userId,
      role: 'user',
      content: userMessage,
      metadata: { 
        mode, 
        timestamp: now,
        messageLength: userMessage.length
      }
    })

    // Save agent response
    await (supabase as any).from('chat_messages').insert({
      session_id: actualSessionId,
      user_id: userId,
      role: 'assistant',
      content: agentResponse,
      metadata: { 
        mode, 
        timestamp: now,
        agentMetadata: metadata,
        responseLength: agentResponse.length
      }
    })

    // Update session timestamp and metadata
    await (supabase as any)
      .from('chat_sessions')
      .update({ 
        updated_at: now,
        context: {
          mode,
          lastInteraction: now,
          messageCount: 'increment', // TODO: Implement proper counter
          performance: metadata
        }
      })
      .eq('id', actualSessionId)

    const duration = Date.now() - startTime
    console.log(`[API] Conversation saved successfully in ${duration}ms`)

    return actualSessionId
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[API] Error saving conversation after ${duration}ms:`, error)
  }
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now()
  
  try {
    console.log('[API] Chat request received')
    
    // Get request body
    const body = await request.json()
    const { 
      message, 
      sessionId = null, 
      mode = 'recovery',
      widgetContext = null 
    } = body

    console.log(`[API] Request details - Mode: ${mode}, Session: ${sessionId || 'new'}, Widget: ${!!widgetContext}`)

    // Validate input
    const validation = validateInput(message)
    if (!validation.isValid) {
      console.log(`[API] Input validation failed: ${validation.error}`)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get user from Supabase auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[API] Authentication failed')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[API] Authenticated user: ${user.id}`)

    // Rate limiting
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown'
    const rateLimitKey = `${user.id}-${clientIp}`

    const rateLimit = checkRateLimit(rateLimitKey)
    if (!rateLimit.allowed) {
      console.log(`[API] Rate limit exceeded for user: ${user.id}`)
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429 }
      )
    }

    // Load user context
    const contextStartTime = Date.now()
    const context = await loadUserContext(user.id, supabase)
    const contextDuration = Date.now() - contextStartTime
    console.log(`[API] User context loaded in ${contextDuration}ms`)

    // Add widget context if provided
    if (widgetContext) {
      context.widgetContext = widgetContext
    }

    // Route to appropriate agent
    const agentResponse = await routeToAgent(message, user.id, mode, context)

    if (!agentResponse.success) {
      console.error(`[API] Agent response failed: ${agentResponse.error}`)
      return NextResponse.json(
        { error: agentResponse.error || 'Failed to generate response' },
        { status: 500 }
      )
    }

    // Save conversation with enhanced metadata
    const finalSessionId = await saveConversation(
      user.id,
      sessionId,
      message,
      agentResponse.response,
      mode,
      agentResponse.metadata,
      supabase
    )

    const totalDuration = Date.now() - requestStartTime
    console.log(`[API] Request completed successfully in ${totalDuration}ms`)

    // TODO: Future - Generate and store embeddings for semantic search
    // await generateAndStoreEmbeddings(user.id, message, agentResponse.response)

    return NextResponse.json({
      response: agentResponse.response,
      sessionId: finalSessionId,
      mode,
      timestamp: new Date().toISOString(),
      performance: {
        totalDuration,
        contextLoadDuration: contextDuration,
        agentDuration: agentResponse.metadata?.duration || 0,
        toolsUsed: agentResponse.metadata?.toolsUsed || [],
        modelUsed: agentResponse.metadata?.modelUsed || 'unknown'
      },
      usage: {
        tokensUsed: agentResponse.metadata?.tokensUsed || 'estimated',
        remainingRequests: 20 - (rateLimitStore.get(rateLimitKey)?.count || 0)
      }
    })

  } catch (error) {
    const totalDuration = Date.now() - requestStartTime
    console.error(`[API] Unhandled error after ${totalDuration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        performance: {
          totalDuration,
          failed: true
        }
      },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (sessionId) {
      // Get specific session messages
      const { data: messages, error } = await (supabase as any)
        .from('chat_messages')
        .select('role, content, created_at, metadata')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        )
      }

      return NextResponse.json({ messages })
    } else {
      // Get user's chat sessions
      const { data: sessions, error } = await (supabase as any)
        .from('chat_sessions')
        .select('id, title, agent_type, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch sessions' },
          { status: 500 }
        )
      }

      return NextResponse.json({ sessions })
    }
  } catch (error) {
    console.error('Chat GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 