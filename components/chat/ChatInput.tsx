'use client'

import { useState, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mic, Send } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage)
      setMessage('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleMicClick = () => {
    // TODO: Implement voice input functionality
    console.log('Voice input not yet implemented')
  }

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-300/60 shadow-sm hover:shadow-md hover:border-gray-400/60 transition-all duration-200 p-3">
        {/* Message Input */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything…"
          disabled={isLoading}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 text-gray-800 font-medium"
        />
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Microphone Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMicClick}
            disabled={isLoading}
            className="h-9 w-9 rounded-xl hover:bg-gray-200/60 transition-all duration-200 hover:scale-105"
          >
            <Mic className="h-4 w-4 text-gray-600" />
            <span className="sr-only">Voice input</span>
          </Button>
          
          {/* Send Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className={`h-9 w-9 rounded-xl transition-all duration-200 hover:scale-105 ${
              message.trim() && !isLoading
                ? 'hover:bg-primary/15 text-primary shadow-sm hover:shadow-md'
                : 'hover:bg-gray-200/60 text-gray-500'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
      
      {/* Enhanced Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-300/60 shadow-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary"></div>
            <span className="font-medium">Zeger is thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
} 