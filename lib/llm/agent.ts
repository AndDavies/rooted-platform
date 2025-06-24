// lib/llm/agent.ts
import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createReactAgent } from "langchain/agents"
import { PromptTemplate } from "@langchain/core/prompts"
import { getHRVTrendTool } from "./tools/getHRVTrend"
import { getSleepTrendTool } from "./tools/getSleepTrend"
import { recoveryCoachSystemMessage } from "@/lib/prompts/recoveryCoachPrompt"

// Types for better error handling and response structure
interface AgentResponse {
  success: boolean
  response: string
  error: string | null
  metadata?: {
    duration: number
    apiDuration?: number
    tokensUsed?: number
    toolsUsed: string[]
    modelUsed: string
    routingError?: boolean
  }
}

interface AgentContext {
  userId?: string
  chatHistory?: string
  userProfile?: any
  widgetContext?: any
}

export async function createRecoveryAgent(userId?: string) {
  const startTime = Date.now()
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables")
    }

    console.log(`[Agent] Creating recovery agent for user: ${userId || 'anonymous'}`)

    const model = new ChatOpenAI({
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      streaming: false,
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    const tools = [
      getHRVTrendTool(userId),
      getSleepTrendTool(userId)
    ]

    console.log(`[Agent] Tools loaded: ${tools.map(t => t.name).join(', ')}`)

    // Create a proper prompt template for the React agent
    const prompt = PromptTemplate.fromTemplate(`${recoveryCoachSystemMessage}

You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}`)

    const agent = await createReactAgent({
      llm: model,
      tools,
      prompt,
    })

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: process.env.NODE_ENV === "development",
      maxIterations: 3,
      returnIntermediateSteps: true, // For debugging and logging
    })

    const duration = Date.now() - startTime
    console.log(`[Agent] Agent created successfully in ${duration}ms`)

    return agentExecutor
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[Agent] Failed to create agent after ${duration}ms:`, error)
    throw error
  }
}

export async function runRecoveryAgent(
  userMessage: string, 
  userId?: string, 
  context: AgentContext = {}
): Promise<AgentResponse> {
  const startTime = Date.now()
  const toolsUsed: string[] = []
  
  console.log(`[Agent] Starting recovery agent for user: ${userId || 'anonymous'}`)
  console.log(`[Agent] User message: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"`)

  try {
    // Validate input
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error("User message cannot be empty")
    }

    if (userMessage.length > 4000) {
      throw new Error("User message too long (max 4000 characters)")
    }

    const agent = await createRecoveryAgent(userId)

    // Build contextual prompt
    let fullPrompt = userMessage
    
    if (context.chatHistory) {
      fullPrompt = `Previous conversation context: ${context.chatHistory}\n\nCurrent question: ${userMessage}`
    }

    if (context.userProfile) {
      fullPrompt = `User context: ${JSON.stringify(context.userProfile)}\n\n${fullPrompt}`
    }

    if (context.widgetContext) {
      fullPrompt = `Widget context: ${JSON.stringify(context.widgetContext)}\n\n${fullPrompt}`
    }

    console.log(`[Agent] Executing agent with enhanced context...`)

    // Execute the agent
    const response = await agent.invoke({
      input: fullPrompt,
    })

    // Extract tools used from intermediate steps
    if (response.intermediateSteps) {
      response.intermediateSteps.forEach((step: any) => {
        if (step.action && step.action.tool) {
          toolsUsed.push(step.action.tool)
        }
      })
    }

    const duration = Date.now() - startTime
    
    console.log(`[Agent] Success! Response generated in ${duration}ms`)
    console.log(`[Agent] Tools used: ${toolsUsed.join(', ') || 'none'}`)
    console.log(`[Agent] Response length: ${response.output?.length || 0} characters`)

    return {
      success: true,
      response: response.output || "I apologize, but I wasn't able to generate a response. Please try rephrasing your question.",
      error: null,
      metadata: {
        duration,
        toolsUsed,
        modelUsed: "gpt-4-turbo-preview",
        // TODO: Add token counting when available
      }
    }

  } catch (error) {
    const duration = Date.now() - startTime
    
    console.error(`[Agent] Error after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      messageLength: userMessage?.length,
      toolsUsed
    })

    // Determine error type and provide appropriate response
    let userFriendlyMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        userFriendlyMessage = "I'm experiencing a configuration issue. Please contact support."
      } else if (error.message.includes("rate limit") || error.message.includes("quota")) {
        userFriendlyMessage = "I'm currently experiencing high demand. Please try again in a few moments."
      } else if (error.message.includes("network") || error.message.includes("timeout")) {
        userFriendlyMessage = "I'm having connectivity issues. Please check your connection and try again."
      } else if (error.message.includes("too long")) {
        userFriendlyMessage = "Your message is too long. Please try a shorter question."
      } else if (error.message.includes("empty")) {
        userFriendlyMessage = "Please enter a message to chat with me."
      }
    }

    return {
      success: false,
      response: userFriendlyMessage,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      metadata: {
        duration,
        toolsUsed,
        modelUsed: "gpt-4-turbo-preview",
      }
    }
  }
}

// Enhanced wrapper function for API route usage
export async function runRecoveryAgentForAPI(
  userMessage: string,
  userId?: string,
  chatHistory?: string,
  userProfile?: any,
  widgetContext?: any
): Promise<AgentResponse> {
  return runRecoveryAgent(userMessage, userId, {
    chatHistory,
    userProfile,
    widgetContext
  })
}
