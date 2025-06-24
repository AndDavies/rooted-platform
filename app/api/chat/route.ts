import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Implement chat with AI agent (OpenAI + LangChain function chain)
  // This will include biometric context and memory
  
  try {
    const body = await request.json()
    const { message } = body

    // Placeholder response
    return NextResponse.json({
      response: "AI Coach functionality coming soon! Your message: " + message,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 