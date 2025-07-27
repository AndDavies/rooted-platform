// lib/llm/agent.ts
import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createReactAgent } from "langchain/agents"
import { PromptTemplate } from "@langchain/core/prompts"
import { getAllWellnessTools } from "./tools"
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
  userProfile?: Record<string, unknown>
  widgetContext?: Record<string, unknown>
}

interface AgentStep {
  action?: {
    tool?: string
  }
}

export async function createRecoveryAgent(userId?: string) {
  const startTime = Date.now()
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables")
    }

    console.log(`[Agent] Creating recovery agent for user: ${userId || 'anonymous'}`)

    const model = new ChatOpenAI({
      model: "gpt-4.1-mini",
      temperature: 0.1, // Very low temperature for consistent behavior and to prevent loops
      streaming: false,
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    const tools = getAllWellnessTools(userId)

    console.log(`[Agent] Tools loaded: ${tools.map(t => t.name).join(', ')}`)

    // Create a proper prompt template for the React agent
    const prompt = PromptTemplate.fromTemplate(`${recoveryCoachSystemMessage}

You have access to the following tools:

{tools}

CRITICAL: You MUST follow this exact format for ALL responses. Do not deviate from this format under any circumstances.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action (use empty string "" if the tool needs no input)
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

IMPORTANT RULES:
1. If you don't need tools to answer the question, skip the Action/Action Input/Observation steps and go directly to "Final Answer:"
2. Every response MUST end with "Final Answer:" followed by your complete response
3. After getting a successful tool observation that answers the user's question, immediately proceed to "Final Answer:" - do NOT call the same tool again
4. For tools that need no input, use an empty string "" as the Action Input
5. If a tool gives you the information needed to answer the question, stop using tools and provide the Final Answer
6. Never call the same tool multiple times with the same input
7. CRITICAL: After ONE successful tool call that provides data, you MUST immediately proceed to "Final Answer:" and provide your response. Do not call any more tools.
8. If you receive a tool observation with data, that is your signal to stop and give the Final Answer
9. STOP IMMEDIATELY after any tool gives you data - do not call tools again
10. If you see ANY tool observation that contains data, write "Final Answer:" next

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
      maxIterations: 4, // Reduced to prevent loops, should be enough for most queries
      returnIntermediateSteps: true, // For debugging and logging
      handleParsingErrors: true, // Better error handling
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

    // The agent should naturally include "Final Answer:" but if it doesn't, that's fine
    // The UI will handle cleaning up the display format

    // Extract tools used from intermediate steps
    if (response.intermediateSteps) {
      response.intermediateSteps.forEach((step: AgentStep) => {
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
      } else if (error.message.includes("OUTPUT_PARSING_FAILURE") || error.message.includes("parsing") || error.message.includes("format")) {
        userFriendlyMessage = "I had trouble understanding your request. Could you please rephrase your question more specifically?"
        console.warn(`[Agent] Output parsing failure detected for input: "${userMessage}"`)
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
  userProfile?: Record<string, unknown>,
  widgetContext?: Record<string, unknown>
): Promise<AgentResponse> {
  return runRecoveryAgent(userMessage, userId, {
    chatHistory,
    userProfile,
    widgetContext
  })
}
