'use client'

import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Bot, Lightbulb, Heart, AlertTriangle, Activity, Moon, Calendar, BarChart3 } from 'lucide-react'
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
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4">
        <div className="text-center py-4 px-4 max-w-xl mx-auto my-auto">
          {/* Enhanced Bot Avatar with Subtle Animation */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-green via-herbal-olive to-emerald-green flex items-center justify-center mx-auto shadow-xl border-4 border-white/20 relative overflow-hidden">
              <Bot size={24} className="text-white relative z-10" />
              {/* Subtle animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/20 to-herbal-olive/20 animate-pulse"></div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-maximum-yellow/20 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-warm-clay/30 rounded-full animate-ping"></div>
          </div>

          <h3 className="text-2xl font-bold text-charcoal-ash mb-4 bg-gradient-to-r from-emerald-green to-herbal-olive bg-clip-text text-transparent">
            Meet Your AI Wellness Coach
          </h3>

          <p className="text-base text-dusky-plum max-w-md mx-auto mb-6 leading-relaxed">
            Hi! I&apos;m <strong className="text-emerald-green font-semibold">Zeger</strong> — your intelligent, personalized recovery and wellness coach. I've been trained on 
            trusted medical journals, clinical research, and years of holistic wellness knowledge to help you interpret your wearable data 
            and truly understand what it means for your stress, sleep, energy, and recovery.
          </p>

          {/* Compact suggestion card */}
          <div className="bg-gradient-to-br from-papaya-whip via-cosmic-latte to-papaya-whip rounded-xl p-6 mb-6 border border-emerald-green/10 shadow-lg relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/5 to-herbal-olive/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-green to-herbal-olive flex items-center justify-center">
                  <Lightbulb className="text-white text-xs" />
                </div>
                <h4 className="text-base font-semibold text-charcoal-ash">You can ask me things like:</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/50 border border-emerald-green/10 hover:border-emerald-green/20 transition-colors">
                  <Heart className="text-emerald-green text-sm mt-0.5" />
                  <em className="text-xs text-dusky-plum">"How's my recovery this week based on my HRV and sleep?"</em>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/50 border border-emerald-green/10 hover:border-emerald-green/20 transition-colors">
                  <AlertTriangle className="text-maximum-yellow text-sm mt-0.5" />
                  <em className="text-xs text-dusky-plum">"Am I at risk of burnout right now?"</em>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/50 border border-emerald-green/10 hover:border-emerald-green/20 transition-colors">
                  <Activity className="text-warm-clay text-sm mt-0.5" />
                  <em className="text-xs text-dusky-plum">"Why is my stress score high, and what can I do about it?"</em>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/50 border border-emerald-green/10 hover:border-emerald-green/20 transition-colors">
                  <Moon className="text-herbal-olive text-sm mt-0.5" />
                  <em className="text-xs text-dusky-plum">"How does deep sleep affect my recovery?"</em>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/50 border border-emerald-green/10 hover:border-emerald-green/20 transition-colors">
                  <Calendar className="text-emerald-green text-sm mt-0.5" />
                  <em className="text-xs text-dusky-plum">"Can you give me a recovery plan for the next 3 days?"</em>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/50 border border-emerald-green/10 hover:border-emerald-green/20 transition-colors">
                  <BarChart3 className="text-maximum-yellow text-sm mt-0.5" />
                  <em className="text-xs text-dusky-plum">"Show me my weekly wellness trends"</em>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-green/10 to-herbal-olive/10 rounded-lg p-3 border border-emerald-green/20">
            <p className="text-xs text-dusky-plum font-medium">
              My goal is to help you make sense of your data — and guide you toward better energy, balance, and resilience.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex gap-4 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Enhanced Avatar with Better Brand Colors */}
          <div className="flex-shrink-0">
            <Avatar className="h-12 w-12 shadow-lg border-2">
              <AvatarFallback 
                className={`${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-warm-clay via-maximum-yellow to-warm-clay text-white border-2 border-warm-clay/40 shadow-warm-clay/20' 
                    : 'bg-gradient-to-br from-emerald-green via-herbal-olive to-emerald-green text-white border-2 border-emerald-green/40 shadow-emerald-green/20'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-6 w-6" />
                ) : (
                  <Bot className="h-6 w-6" />
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
            {/* Enhanced Message Content with Better Brand Colors */}
            <div
              className={`rounded-2xl px-6 py-4 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-warm-clay via-maximum-yellow to-warm-clay text-white border-warm-clay/40 rounded-br-lg shadow-warm-clay/20 hover:shadow-warm-clay/30'
                  : 'bg-gradient-to-br from-papaya-whip via-cosmic-latte to-papaya-whip text-charcoal-ash border-emerald-green/20 rounded-bl-lg hover:border-emerald-green/40 hover:shadow-emerald-green/20 relative overflow-hidden'
              }`}
            >
                            {/* Subtle background pattern for bot messages */}
              {message.role === 'assistant' && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/5 to-herbal-olive/5"></div>
              )}
              <div className="relative z-10">
                {message.role === 'assistant' ? (
                  <div className="text-sm leading-relaxed font-medium prose prose-sm max-w-none prose-headings:text-charcoal-ash prose-headings:font-semibold prose-strong:text-emerald-green prose-strong:font-semibold prose-ul:my-2 prose-li:my-1 prose-p:my-2 prose-p:leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom components for better styling
                        h1: ({children}) => <h1 className="text-lg font-semibold text-charcoal-ash mb-2 mt-3 first:mt-0">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-semibold text-charcoal-ash mb-2 mt-3 first:mt-0">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-semibold text-charcoal-ash mb-1 mt-2 first:mt-0">{children}</h3>,
                        p: ({children}) => <p className="text-sm leading-relaxed text-dusky-plum mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="text-sm list-disc list-inside space-y-1 mb-2 text-dusky-plum">{children}</ul>,
                        ol: ({children}) => <ol className="text-sm list-decimal list-inside space-y-1 mb-2 text-dusky-plum">{children}</ol>,
                        li: ({children}) => <li className="text-sm text-dusky-plum">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-emerald-green">{children}</strong>,
                        em: ({children}) => <em className="italic text-dusky-plum/80">{children}</em>,
                        code: ({children}) => <code className="bg-misty-sage/20 text-dusky-plum px-1 py-0.5 rounded text-xs font-mono border border-misty-sage/30">{children}</code>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-emerald-green/30 pl-3 italic text-dusky-plum my-2 bg-emerald-green/5 rounded-r">{children}</blockquote>
                      }}
                    >
                      {message.content.replace(/^Final Answer:\s*/, "")}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">
                    {message.content}
                  </div>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className={`text-xs text-muted-foreground mt-1 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
} 