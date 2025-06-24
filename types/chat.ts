// Shared types for chat interface
export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface ChatResponse {
  response: string
  sessionId: string
  mode: string
  timestamp: string
  usage: {
    tokensUsed: string
    remainingRequests: number
  }
}

export interface ChatSession {
  id: string
  title: string | null
  agent_type: string
  created_at: string
  updated_at: string
} 