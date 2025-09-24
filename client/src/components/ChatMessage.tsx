import { useState } from "react"
import { Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  sources?: { title: string; url?: string; relevance?: number }[]
  isLoading?: boolean
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void
  onRetry?: (messageId: string) => void
  className?: string
}

export function ChatMessage({
  id,
  role,
  content,
  timestamp,
  sources = [],
  isLoading = false,
  onFeedback,
  onRetry,
  className,
}: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    console.log("Message copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type)
    console.log(`Feedback ${type} for message:`, id)
    onFeedback?.(id, type)
  }

  const handleRetry = () => {
    console.log("Retry requested for message:", id)
    onRetry?.(id)
  }

  const isUser = role === "user"
  const isAssistant = role === "assistant"

  return (
    <div
      className={cn(
        "flex gap-3 p-4",
        isUser && "flex-row-reverse",
        className
      )}
      data-testid={`message-${role}-${id}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(
          isUser && "bg-primary text-primary-foreground",
          isAssistant && "bg-blue-500 text-white"
        )}>
          {isUser ? "U" : isAssistant ? "AI" : "S"}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex-1 space-y-2", isUser && "text-right")}>
        <Card className={cn(
          "p-3",
          isUser && "bg-primary text-primary-foreground ml-12",
          !isUser && "mr-12"
        )}>
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            )}

            {sources.length > 0 && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs text-muted-foreground font-medium">Sources:</p>
                <div className="flex flex-wrap gap-1">
                  {sources.map((source, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs cursor-pointer hover-elevate"
                      onClick={() => source.url && window.open(source.url, '_blank')}
                      data-testid={`source-${index}`}
                    >
                      {source.title}
                      {source.relevance && (
                        <span className="ml-1 text-xs opacity-60">
                          {Math.round(source.relevance * 100)}%
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className={cn(
          "flex items-center gap-1 text-xs text-muted-foreground",
          isUser && "justify-end"
        )}>
          <span data-testid={`timestamp-${id}`}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {!isUser && !isLoading && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
                data-testid={`button-copy-${id}`}
              >
                <Copy className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6",
                  feedback === "positive" && "text-green-600"
                )}
                onClick={() => handleFeedback("positive")}
                data-testid={`button-thumbs-up-${id}`}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6",
                  feedback === "negative" && "text-red-600"
                )}
                onClick={() => handleFeedback("negative")}
                data-testid={`button-thumbs-down-${id}`}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRetry}
                data-testid={`button-retry-${id}`}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          )}

          {copied && (
            <span className="text-green-600 ml-2">Copied!</span>
          )}
        </div>
      </div>
    </div>
  )
}