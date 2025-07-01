'use client'

import { useState } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { RiChatSmile3Line } from "@remixicon/react";
import ChatLog from '@/components/chat/ChatLog'
import ChatInput from '@/components/chat/ChatInput'
import { Message, ChatResponse } from '@/types/chat'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const handleSendMessage = async (messageContent: string) => {
    // Add user message to chat immediately
    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send message to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          sessionId,
          mode: 'recovery',
          widgetContext: {
            source: 'chat_page',
            timestamp: new Date().toISOString()
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data: ChatResponse = await response.json()

      // Update session ID if this is the first message
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId)
      }

      // Add AI response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: `I'm sorry, I'm having trouble responding right now. ${
          error instanceof Error ? error.message : 'Please try again later.'
        }`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Fixed height */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger className="-ms-4" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  <RiChatSmile3Line size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>AI Coach</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main content area - takes remaining height */}
      <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-6">
        {/* Header section - fixed height */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-100 mb-2">Your Smart Recovery Coach</h1>
          <p className="text-base text-muted-foreground max-w-prose">
            Zeger turns your wearable data into clarity. Ask about HRV, sleep, stress, or burnout — and get real insights, not just numbers.
          </p>
        </div>

        {/* Chat Container - takes remaining space */}
        <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-border/60 border-gray-300/60 shadow-lg shadow-gray-900/5 overflow-hidden">
          {/* Chat Messages - scrollable area */}
          <div className="flex-1 min-h-0">
            <ChatLog messages={messages} />
          </div>
          
          {/* Chat Input - always visible at bottom */}
          <div className="shrink-0 border-t border-border/40 bg-transparent backdrop-blur-sm">
            <ChatInput 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 