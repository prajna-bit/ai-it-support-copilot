import { BookOpen, Clock, Tag, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface KnowledgeCardProps {
  id: string
  title: string
  content: string
  category: string
  tags?: string[]
  relevanceScore?: number
  updatedAt: Date
  onClick?: (id: string) => void
  onOpenExternal?: (id: string) => void
  className?: string
}

export function KnowledgeCard({
  id,
  title,
  content,
  category,
  tags = [],
  relevanceScore,
  updatedAt,
  onClick,
  onOpenExternal,
  className,
}: KnowledgeCardProps) {
  const handleClick = () => {
    console.log("Knowledge card clicked:", id)
    onClick?.(id)
  }

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Opening knowledge article externally:", id)
    onOpenExternal?.(id)
  }

  const timeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)

    if (diffDays < 30) return `${diffDays}d ago`
    return `${diffMonths}m ago`
  }

  const truncateContent = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover-elevate",
        relevanceScore && relevanceScore > 0.8 && "border-green-200 dark:border-green-800",
        className
      )}
      onClick={handleClick}
      data-testid={`knowledge-card-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-medium text-sm line-clamp-1" data-testid={`knowledge-title-${id}`}>
                {title}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3" data-testid={`knowledge-content-${id}`}>
              {truncateContent(content)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {relevanceScore && (
              <Badge
                variant={relevanceScore > 0.8 ? "default" : "secondary"}
                className="text-xs"
                data-testid={`knowledge-relevance-${id}`}
              >
                {Math.round(relevanceScore * 100)}%
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleOpenExternal}
              data-testid={`button-open-external-${id}`}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <Badge variant="outline" className="text-xs" data-testid={`knowledge-category-${id}`}>
            {category}
          </Badge>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs gap-1"
                  data-testid={`knowledge-tag-${index}-${id}`}
                >
                  <Tag className="h-2 w-2" />
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span data-testid={`knowledge-updated-${id}`}>Updated {timeAgo(updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}