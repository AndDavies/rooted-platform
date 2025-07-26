'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-end gap-4">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Zeger about your wellness data..."
            className="w-full resize-none rounded-2xl border-2 border-emerald-green/20 bg-gradient-to-br from-papaya-whip via-cosmic-latte to-papaya-whip text-charcoal-ash placeholder-dusky-plum/60 px-4 py-3 pr-12 focus:border-emerald-green/40 focus:outline-none focus:ring-2 focus:ring-emerald-green/20 transition-all duration-300 min-h-[44px] max-h-32 shadow-lg hover:shadow-xl"
            disabled={isLoading}
            rows={1}
          />
          <div className="absolute right-3 bottom-3 text-xs text-dusky-plum/40 font-medium">
            {message.length}/4000
          </div>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          size="icon"
          className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-green via-herbal-olive to-emerald-green hover:from-emerald-green/90 hover:via-herbal-olive/90 hover:to-emerald-green/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-emerald-green/20"
        >
                      {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
        </Button>
      </div>
      
      <div className="mt-3 text-xs text-dusky-plum/60 text-center font-medium">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  )
} 