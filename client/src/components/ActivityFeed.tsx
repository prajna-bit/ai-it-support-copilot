import { Clock, User, MessageSquare, AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "incident_created" | "incident_resolved" | "message_sent" | "knowledge_updated"
  title: string
  description: string
  user: { name: string; avatar?: string }
  timestamp: Date
  metadata?: {
    incidentId?: string
    priority?: string
    status?: string
  }
}

interface ActivityFeedProps {
  className?: string
  limit?: number
}

export function ActivityFeed({ className, limit = 10 }: ActivityFeedProps) {
  // TODO: Remove mock functionality - this will fetch real activity data
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "incident_created",
      title: "New Critical Incident",
      description: "Database connection timeout in production",
      user: { name: "Sarah Chen" },
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      metadata: { incidentId: "INC-001", priority: "critical" }
    },
    {
      id: "2",
      type: "message_sent",
      title: "AI Assistance Used",
      description: "Asked AI about MySQL performance optimization",
      user: { name: "Mike Johnson" },
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      id: "3",
      type: "incident_resolved",
      title: "Incident Resolved",
      description: "Email server connectivity restored",
      user: { name: "Alex Rodriguez" },
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      metadata: { incidentId: "INC-002", status: "resolved" }
    },
    {
      id: "4",
      type: "knowledge_updated",
      title: "Knowledge Base Updated",
      description: "Added troubleshooting guide for VPN issues",
      user: { name: "Emma Wilson" },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "5",
      type: "incident_created",
      title: "New Incident",
      description: "Printer connectivity issues in Floor 3",
      user: { name: "David Kim" },
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      metadata: { incidentId: "INC-003", priority: "medium" }
    }
  ].slice(0, limit)

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "incident_created":
        return AlertTriangle
      case "incident_resolved":
        return CheckCircle
      case "message_sent":
        return MessageSquare
      case "knowledge_updated":
        return FileText
      default:
        return AlertTriangle
    }
  }

  const getTypeColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "incident_created":
        return "text-red-500"
      case "incident_resolved":
        return "text-green-500"
      case "message_sent":
        return "text-blue-500"
      case "knowledge_updated":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  const timeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 60) return `${diffMins}m ago`
    return `${diffHours}h ago`
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type)
          return (
            <div
              key={activity.id}
              className="flex gap-3 p-2 rounded-md hover-elevate cursor-pointer"
              onClick={() => console.log("Activity clicked:", activity.id)}
              data-testid={`activity-${activity.id}`}
            >
              <div className={cn("mt-1", getTypeColor(activity.type))}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium line-clamp-1" data-testid={`activity-title-${activity.id}`}>
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`activity-description-${activity.id}`}>
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo(activity.timestamp)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground" data-testid={`activity-user-${activity.id}`}>
                      {activity.user.name}
                    </span>
                  </div>
                  
                  {activity.metadata?.priority && (
                    <Badge
                      variant={activity.metadata.priority === "critical" ? "destructive" : "secondary"}
                      className="text-xs"
                      data-testid={`activity-priority-${activity.id}`}
                    >
                      {activity.metadata.priority}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}