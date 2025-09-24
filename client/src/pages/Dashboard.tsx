import { SearchBar } from "@/components/SearchBar"
import { QuickActions } from "@/components/QuickActions"
import { ActivityFeed } from "@/components/ActivityFeed"
import { IncidentCard } from "@/components/IncidentCard"
import { KnowledgeCard } from "@/components/KnowledgeCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusIndicator } from "@/components/StatusIndicator"
import { ArrowRight, TrendingUp, Clock, Users, AlertTriangle } from "lucide-react"

export default function Dashboard() {
  // TODO: Remove mock functionality - these will be fetched from API
  const recentIncidents = [
    {
      id: "INC-001",
      title: "Database Connection Timeout",
      description: "Production database experiencing intermittent connection timeouts",
      priority: "critical" as const,
      status: "open" as const,
      category: "Database",
      assignedTo: { name: "Sarah Chen" },
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: "INC-002",
      title: "Email Server Connectivity",
      description: "Users unable to send emails through Outlook client",
      priority: "high" as const,
      status: "in_progress" as const,
      category: "Email",
      assignedTo: { name: "Mike Johnson" },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    }
  ]

  const suggestedKnowledge = [
    {
      id: "KB-001",
      title: "Database Connection Troubleshooting",
      content: "Comprehensive guide for diagnosing and resolving database connection issues including timeout errors and performance optimization.",
      category: "Database",
      tags: ["MySQL", "PostgreSQL", "Performance"],
      relevanceScore: 0.95,
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "KB-002",
      title: "Email System Maintenance Guide",
      content: "Best practices for maintaining email server infrastructure and resolving common connectivity issues.",
      category: "Email",
      tags: ["Exchange", "SMTP", "Troubleshooting"],
      relevanceScore: 0.88,
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    }
  ]

  const stats = [
    {
      title: "Open Incidents",
      value: "12",
      change: "+3",
      trend: "up",
      icon: AlertTriangle,
      color: "text-red-500"
    },
    {
      title: "Avg. Resolution",
      value: "2.4h",
      change: "-15m",
      trend: "down",
      icon: Clock,
      color: "text-green-500"
    },
    {
      title: "Team Load",
      value: "78%",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "text-yellow-500"
    },
    {
      title: "Satisfaction",
      value: "94%",
      change: "+2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-500"
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold" data-testid="dashboard-title">
            Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <StatusIndicator status="online" />
            <span className="text-sm text-muted-foreground">All systems operational</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your IT support operations.
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        onSearch={(query, filters) => console.log("Dashboard search:", query, filters)}
        className="max-w-3xl"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover-elevate cursor-pointer" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${stat.color}`}>{stat.change}</span>
                      <span className="text-xs text-muted-foreground">vs last week</span>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Incidents & Knowledge */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Incidents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Critical Incidents</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-incidents">
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  {...incident}
                  onClick={(id) => console.log("Navigate to incident:", id)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Suggested Knowledge */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Suggested Knowledge</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-knowledge">
                Browse All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedKnowledge.map((knowledge) => (
                <KnowledgeCard
                  key={knowledge.id}
                  {...knowledge}
                  onClick={(id) => console.log("Navigate to knowledge:", id)}
                  onOpenExternal={(id) => console.log("Open knowledge externally:", id)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Activity */}
        <div className="space-y-6">
          <QuickActions />
          <ActivityFeed limit={8} />
        </div>
      </div>
    </div>
  )
}