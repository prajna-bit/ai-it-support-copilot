import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search as SearchIcon, Bot, BookOpen, MessageSquare, Users, Settings } from "lucide-react"
import { Link } from "wouter"

interface SearchResult {
  type: "knowledge" | "incident" | "chat" | "team" | "setting"
  id: string
  title: string
  description: string
  category?: string
  url: string
  relevance: number
}

export default function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Mock search results for demonstration
  const allSearchableContent = [
    {
      type: "knowledge" as const,
      id: "KB001",
      title: "Windows Blue Screen of Death (BSOD) Troubleshooting",
      description: "Blue Screen of Death errors indicate critical system failures. Solutions include Safe Mode, driver updates, memory diagnostics.",
      category: "Windows",
      url: "/knowledge",
      keywords: ["bsod", "blue screen", "windows", "crash", "error", "driver", "memory"]
    },
    {
      type: "knowledge" as const,
      id: "KB003", 
      title: "Network Connectivity Issues Resolution",
      description: "Systematic approach to network problems: check connections, restart adapter, flush DNS cache, reset network stack.",
      category: "Network",
      url: "/knowledge",
      keywords: ["network", "connectivity", "dns", "wifi", "internet", "connection", "adapter"]
    },
    {
      type: "knowledge" as const,
      id: "KB005",
      title: "Email Client Configuration and Troubleshooting", 
      description: "Email setup for Outlook and other clients. Fix authentication failures, server settings, SSL/TLS configuration.",
      category: "Email",
      url: "/knowledge",
      keywords: ["email", "outlook", "smtp", "imap", "authentication", "configuration", "mail"]
    },
    {
      type: "chat" as const,
      id: "chat-ai",
      title: "AI Assistant Chat",
      description: "Get instant help with IT issues. AI-powered incident analysis and recommendations.",
      url: "/chat",
      keywords: ["ai", "chat", "assistant", "help", "analysis", "incident", "support"]
    },
    {
      type: "incident" as const,
      id: "servicenow",
      title: "ServiceNow Incidents",
      description: "View and manage IT incidents. Create new tickets and get AI-powered analysis.",
      url: "/incidents", 
      keywords: ["servicenow", "incidents", "tickets", "create", "manage", "analysis"]
    },
    {
      type: "team" as const,
      id: "team-management",
      title: "IT Support Team",
      description: "View team members, workload distribution, and contact information.",
      url: "/team",
      keywords: ["team", "members", "support", "staff", "workload", "contact"]
    },
    {
      type: "setting" as const,
      id: "system-settings",
      title: "System Settings",
      description: "Configure AI settings, notifications, and system preferences.",
      url: "/settings",
      keywords: ["settings", "configuration", "ai", "notifications", "preferences", "system"]
    }
  ]

  const performSearch = () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate search delay
    setTimeout(() => {
      const queryLower = query.toLowerCase()
      
      const searchResults = allSearchableContent
        .map(item => {
          let relevance = 0
          
          // Title match (highest priority)
          if (item.title.toLowerCase().includes(queryLower)) {
            relevance += 10
          }
          
          // Individual word matches in title
          const queryWords = queryLower.split(' ').filter(word => word.length > 2)
          queryWords.forEach(word => {
            if (item.title.toLowerCase().includes(word)) {
              relevance += 8
            }
            if (item.description.toLowerCase().includes(word)) {
              relevance += 4
            }
          })
          
          // Description match
          if (item.description.toLowerCase().includes(queryLower)) {
            relevance += 5
          }
          
          // Keywords match
          const matchingKeywords = item.keywords.filter(keyword => {
            const keywordLower = keyword.toLowerCase()
            return keywordLower.includes(queryLower) || queryLower.includes(keywordLower) ||
                   queryLower.split(' ').some(word => word.length > 2 && keywordLower.includes(word))
          })
          relevance += matchingKeywords.length * 3
          
          // Category match
          if (item.category?.toLowerCase().includes(queryLower)) {
            relevance += 7
          }

          return {
            ...item,
            relevance
          }
        })
        .filter(item => item.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 10)

      setResults(searchResults)
      setIsSearching(false)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch()
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "knowledge": return <BookOpen className="h-4 w-4" />
      case "chat": return <MessageSquare className="h-4 w-4" />
      case "incident": return <Bot className="h-4 w-4" />
      case "team": return <Users className="h-4 w-4" />
      case "setting": return <Settings className="h-4 w-4" />
      default: return <SearchIcon className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "knowledge": return "bg-blue-100 text-blue-800"
      case "chat": return "bg-green-100 text-green-800"
      case "incident": return "bg-purple-100 text-purple-800"
      case "team": return "bg-orange-100 text-orange-800"
      case "setting": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SearchIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Universal Search</h1>
          <p className="text-muted-foreground">Search across all IT support resources and features</p>
        </div>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base, chat history, incidents, team info..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                data-testid="universal-search-input"
              />
            </div>
            <Button onClick={performSearch} disabled={isSearching} data-testid="button-universal-search">
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Search Suggestions */}
      {!query && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "BSOD troubleshooting",
                "Email setup",
                "Network issues", 
                "Team contacts",
                "AI settings",
                "Create incident",
                "Performance issues",
                "Printer problems"
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(suggestion)
                    performSearch()
                  }}
                  className="justify-start text-xs"
                  data-testid={`suggestion-${suggestion.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Search Results</h2>
            <Badge variant="secondary">{results.length} result{results.length !== 1 ? "s" : ""}</Badge>
          </div>
          
          {results.map((result) => (
            <Card key={result.id} className="hover-elevate" data-testid={`search-result-${result.id}`}>
              <CardContent className="p-4">
                <Link href={result.url} className="block">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold hover:text-primary">{result.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.category && (
                          <Badge variant="secondary" className="text-xs">
                            {result.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Relevance: {Math.round((result.relevance / 15) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {query && results.length === 0 && !isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try different keywords or browse specific sections:
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button variant="outline" size="sm" asChild>
                <Link href="/knowledge">Knowledge Base</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/chat">AI Chat</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/incidents">Incidents</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}