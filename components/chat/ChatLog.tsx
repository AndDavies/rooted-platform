'use client'

import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Bot } from 'lucide-react'
import { Message } from '@/types/chat'

interface ChatLogProps {
  messages: Message[]
}

export default function ChatLog({ messages }: ChatLogProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center py-8 px-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Bot size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Meet Your AI Wellness Coach</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Hi! I&apos;m Zeger, your personal recovery and wellness coach. I can help you understand your biometric data, 
            provide personalized wellness insights, and answer questions about your health and recovery.
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Ask me about your HRV, sleep patterns, or any wellness questions you have!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex gap-4 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Enhanced Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-9 w-9 shadow-sm border-2 border-white">
              <AvatarFallback 
                className={`${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-primary/15 to-primary/5 text-primary border border-primary/20' 
                    : 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-100'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Enhanced Message Bubble */}
          <div
            className={`flex flex-col max-w-[75%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Message Content */}
            <div
              className={`rounded-2xl px-5 py-3 shadow-sm border transition-all duration-200 hover:shadow-md ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-white border-primary/20 rounded-br-lg shadow-primary/20'
                  : 'bg-white text-gray-900 border-gray-300/60 rounded-bl-lg hover:border-gray-400/60'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {message.content}
              </p>
            </div>

            {/* Enhanced Timestamp */}
            {message.timestamp && (
              <span className="text-xs text-gray-600 mt-2 px-3 font-medium">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        </div>
      ))}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
} 