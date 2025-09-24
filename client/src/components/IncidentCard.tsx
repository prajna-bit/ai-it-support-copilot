import { Clock, User, AlertTriangle, CheckCircle, XCircle, Circle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface IncidentCardProps {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "resolved" | "closed"
  category?: string
  assignedTo?: { name: string; avatar?: string }
  createdAt: Date
  updatedAt: Date
  onClick?: (id: string) => void
  className?: string
}

const priorityConfig = {
  low: { color: "bg-blue-500", variant: "secondary" as const, icon: Circle },
  medium: { color: "bg-yellow-500", variant: "secondary" as const, icon: Circle },
  high: { color: "bg-orange-500", variant: "destructive" as const, icon: AlertTriangle },
  critical: { color: "bg-red-500", variant: "destructive" as const, icon: AlertTriangle },
}

const statusConfig = {
  open: { color: "bg-blue-500", variant: "secondary" as const, icon: Circle },
  in_progress: { color: "bg-yellow-500", variant: "secondary" as const, icon: Circle },
  resolved: { color: "bg-green-500", variant: "default" as const, icon: CheckCircle },
  closed: { color: "bg-gray-500", variant: "outline" as const, icon: XCircle },
}

export function IncidentCard({
  id,
  title,
  description,
  priority,
  status,
  category,
  assignedTo,
  createdAt,
  updatedAt,
  onClick,
  className,
}: IncidentCardProps) {
  const priorityDetails = priorityConfig[priority]
  const statusDetails = statusConfig[status]
  const PriorityIcon = priorityDetails.icon
  const StatusIcon = statusDetails.icon

  const handleClick = () => {
    console.log("Incident clicked:", id)
    onClick?.(id)
  }

  const timeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover-elevate",
        priority === "critical" && "border-red-200 dark:border-red-800",
        priority === "high" && "border-orange-200 dark:border-orange-800",
        className
      )}
      onClick={handleClick}
      data-testid={`incident-card-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm line-clamp-1" data-testid={`incident-title-${id}`}>
                {title}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`incident-description-${id}`}>
              {description}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge
              variant={priorityDetails.variant}
              className="text-xs gap-1"
              data-testid={`incident-priority-${id}`}
            >
              <PriorityIcon className="h-3 w-3" />
              {priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge
              variant={statusDetails.variant}
              className="text-xs gap-1"
              data-testid={`incident-status-${id}`}
            >
              <StatusIcon className="h-3 w-3" />
              {status.replace('_', ' ')}
            </Badge>
            {category && (
              <Badge variant="outline" className="text-xs" data-testid={`incident-category-${id}`}>
                {category}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span data-testid={`incident-time-${id}`}>{timeAgo(updatedAt)}</span>
            </div>

            {assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs">
                    {assignedTo.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-20" data-testid={`incident-assignee-${id}`}>
                  {assignedTo.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}