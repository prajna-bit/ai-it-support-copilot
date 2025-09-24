import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/ChatMessage"
import { StatusIndicator } from "@/components/StatusIndicator"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  sources?: { title: string; url?: string; relevance?: number }[]
  isLoading?: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to your AI-powered IT support assistant! I can help you analyze incidents, search the knowledge base, and provide contextual recommendations. How can I assist you today?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // TODO: Remove mock functionality - these will be real AI suggestions
  const quickSuggestions = [
    "How do I troubleshoot database connection issues?",
    "What are the steps for password reset?",
    "Help me diagnose network connectivity problems",
    "Show me the latest security incident reports"
  ]

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // TODO: Remove mock functionality - this will call the real AI API
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages(prev => [...prev, loadingMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're asking about "${input.trim()}". Based on our knowledge base, here are some relevant insights:

1. **Primary Considerations**: This type of issue typically involves multiple system components.

2. **Diagnostic Steps**: I recommend starting with basic connectivity tests and log analysis.

3. **Common Solutions**: Check the knowledge base articles I've referenced below for detailed troubleshooting steps.

Would you like me to search for more specific information or help you create an incident ticket?`,
        timestamp: new Date(),
        sources: [
          { title: "Troubleshooting Guide - Network Issues", relevance: 0.92 },
          { title: "System Diagnostics Best Practices", relevance: 0.87 }
        ],
      }

      setMessages(prev => prev.slice(0, -1).concat([aiResponse]))
      setIsLoading(false)
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    console.log("Suggestion clicked:", suggestion)
  }

  const handleClearChat = () => {
    setMessages([messages[0]]) // Keep welcome message
    console.log("Chat cleared")
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    console.log("Message feedback:", messageId, feedback)
    // TODO: Send feedback to analytics API
  }

  const handleRetry = (messageId: string) => {
    console.log("Retry message:", messageId)
    // TODO: Implement retry functionality
  }

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold" data-testid="chat-title">AI Assistant</h1>
          <div className="flex items-center gap-2">
            <StatusIndicator status="online" showText={false} className="h-2 w-2" />
            <span className="text-sm text-muted-foreground">RAG system online</span>
            <Badge variant="secondary" className="text-xs">Offline capable</Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          data-testid="button-clear-chat"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-0" ref={scrollAreaRef}>
        <div className="space-y-0">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              {...message}
              onFeedback={handleFeedback}
              onRetry={handleRetry}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t bg-muted/30">
          <p className="text-sm font-medium mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-1 px-2 hover-elevate"
                onClick={() => handleSuggestionClick(suggestion)}
                data-testid={`quick-suggestion-${index}`}
              >
                <Zap className="h-3 w-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about IT support, incidents, or search the knowledge base..."
            className="min-h-[60px] pr-20 resize-none"
            disabled={isLoading}
            data-testid="chat-input"
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              data-testid="button-attach-file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-8 w-8"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}