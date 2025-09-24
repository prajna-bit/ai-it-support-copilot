import { 
  Plus, 
  Search, 
  FileText, 
  AlertTriangle, 
  BookOpen, 
  MessageSquare,
  Settings,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  onClick: () => void
  disabled?: boolean
}

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  // TODO: Remove mock functionality - these will be connected to real actions
  const actions: QuickAction[] = [
    {
      id: "create-incident",
      title: "Create Incident",
      description: "Report a new IT issue",
      icon: Plus,
      onClick: () => console.log("Creating new incident"),
    },
    {
      id: "search-knowledge",
      title: "Search Knowledge",
      description: "Find solutions in KB",
      icon: Search,
      onClick: () => console.log("Searching knowledge base"),
    },
    {
      id: "ai-chat",
      title: "Ask AI Assistant",
      description: "Get instant help",
      icon: MessageSquare,
      onClick: () => console.log("Opening AI chat"),
    },
    {
      id: "critical-incidents",
      title: "Critical Incidents",
      description: "View urgent issues",
      icon: AlertTriangle,
      onClick: () => console.log("Viewing critical incidents"),
    },
    {
      id: "documentation",
      title: "Documentation",
      description: "Browse tech docs",
      icon: BookOpen,
      onClick: () => console.log("Opening documentation"),
    },
    {
      id: "reports",
      title: "Reports",
      description: "View analytics",
      icon: BarChart3,
      onClick: () => console.log("Opening reports"),
    }
  ]

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                className={cn(
                  "h-auto p-3 flex flex-col items-start text-left gap-2 hover-elevate",
                  action.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={action.onClick}
                disabled={action.disabled}
                data-testid={`quick-action-${action.id}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-sm truncate">{action.title}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {action.description}
                </span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}