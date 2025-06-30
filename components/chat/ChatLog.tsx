'use client'

import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Bot } from 'lucide-react'
import { Message } from '@/types/chat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
          <h3 className="text-xl font-semibold text-gray-100 mb-3">Meet Your AI Wellness Coach</h3>

<p className="text-base text-gray-100 max-w-md mx-auto mb-4">
  Hi! I&apos;m <strong>Zeger</strong> — your intelligent, personalized recovery and wellness coach. I’ve been trained on 
  trusted medical journals, clinical research, and years of holistic wellness knowledge to help you interpret your wearable data 
  and truly understand what it means for your stress, sleep, energy, and recovery.
</p>

<p className="text-sm text-gray-100 mb-2">
  You can ask me things like:
</p>

<ul className="list-disc list-inside text-sm text-gray-100 space-y-1 mb-4">
  <li><em>“How’s my recovery this week based on my HRV and sleep?”</em></li>
  <li><em>“Am I at risk of burnout right now?”</em></li>
  <li><em>“Why is my stress score high, and what can I do about it?”</em></li>
  <li><em>“How does deep sleep affect my recovery?”</em></li>
  <li><em>“Can you give me a recovery plan for the next 3 days?”</em></li>
</ul>

<p className="text-sm text-gray-100">
  My goal is to help you make sense of your data — and guide you toward better energy, balance, and resilience.
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
              {message.role === 'assistant' ? (
                <div className="text-sm leading-relaxed font-medium prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-2 prose-li:my-1 prose-p:my-2 prose-p:leading-relaxed">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom components for better styling
                      h1: ({children}) => <h1 className="text-lg font-semibold text-gray-900 mb-2 mt-3 first:mt-0">{children}</h1>,
                      h2: ({children}) => <h2 className="text-base font-semibold text-gray-900 mb-2 mt-3 first:mt-0">{children}</h2>,
                      h3: ({children}) => <h3 className="text-sm font-semibold text-gray-900 mb-1 mt-2 first:mt-0">{children}</h3>,
                      p: ({children}) => <p className="text-sm leading-relaxed text-gray-900 mb-2 last:mb-0">{children}</p>,
                      ul: ({children}) => <ul className="text-sm list-disc list-inside space-y-1 mb-2 text-gray-900">{children}</ul>,
                      ol: ({children}) => <ol className="text-sm list-decimal list-inside space-y-1 mb-2 text-gray-900">{children}</ol>,
                      li: ({children}) => <li className="text-sm text-gray-900">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                      code: ({children}) => <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700 my-2">{children}</blockquote>
                    }}
                  >
                    {message.content.replace(/^Final Answer:\s*/, "")}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {message.content}
                </p>
              )}
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