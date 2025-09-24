import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "online" | "offline" | "degraded" | "maintenance"
  className?: string
  showText?: boolean
}

const statusConfig = {
  online: {
    label: "Online",
    color: "bg-green-500",
    badgeVariant: "default" as const,
  },
  offline: {
    label: "Offline",
    color: "bg-red-500",
    badgeVariant: "destructive" as const,
  },
  degraded: {
    label: "Degraded",
    color: "bg-yellow-500",
    badgeVariant: "secondary" as const,
  },
  maintenance: {
    label: "Maintenance",
    color: "bg-blue-500",
    badgeVariant: "secondary" as const,
  },
}

export function StatusIndicator({ status, className, showText = true }: StatusIndicatorProps) {
  const config = statusConfig[status]

  if (showText) {
    return (
      <Badge variant={config.badgeVariant} className={cn("gap-1", className)} data-testid={`status-${status}`}>
        <div className={cn("h-2 w-2 rounded-full", config.color)} />
        {config.label}
      </Badge>
    )
  }

  return (
    <div
      className={cn("h-2 w-2 rounded-full", config.color, className)}
      title={config.label}
      data-testid={`status-indicator-${status}`}
    />
  )
}