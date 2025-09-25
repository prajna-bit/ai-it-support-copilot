import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Search, Bot, Plus, Clock, User, FileText } from "lucide-react"

interface Incident {
  number: string
  title: string
  description: string
  priority: string
  status: string
  category: string
  created: string
}

interface Analysis {
  incident: Incident
  analysis: string
  relevantKB: any[]
  recommendations: string[]
}

export default function ServiceNow() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadIncidents()
  }, [])

  const loadIncidents = async () => {
    try {
      const response = await fetch("/api/servicenow/incidents")
      if (response.ok) {
        const data = await response.json()
        setIncidents(data.incidents || [])
      }
    } catch (error) {
      console.error("Failed to load incidents:", error)
    }
  }

  const analyzeIncident = async (incident: Incident) => {
    setIsAnalyzing(true)
    setSelectedIncident(incident)
    try {
      const response = await fetch(`/api/servicenow/incidents/${incident.number}/analyze`, {
        method: "POST"
      })
      if (response.ok) {
        const analysisData = await response.json()
        setAnalysis(analysisData)
      }
    } catch (error) {
      console.error("Failed to analyze incident:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    if (priority.includes("Critical")) return "destructive"
    if (priority.includes("High")) return "destructive"
    if (priority.includes("Medium")) return "default"
    return "secondary"
  }

  const getStatusColor = (status: string) => {
    if (status === "New") return "outline"
    if (status === "In Progress") return "default"
    if (status === "Resolved") return "secondary"
    return "outline"
  }

  const filteredIncidents = incidents.filter(incident =>
    incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">ServiceNow Integration</h1>
            <p className="text-muted-foreground">Manage incidents with AI-powered analysis</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-incident">
          <Plus className="h-4 w-4 mr-2" />
          Create Incident
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Incidents</CardTitle>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-incidents"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredIncidents.map((incident) => (
                <Card 
                  key={incident.number} 
                  className="p-4 hover-elevate cursor-pointer"
                  onClick={() => setSelectedIncident(incident)}
                  data-testid={`incident-${incident.number}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{incident.number}</h4>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(incident.priority)}>
                          {incident.priority}
                        </Badge>
                        <Badge variant={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm">{incident.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(incident.created).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {incident.category}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Incident Details & Analysis */}
        <div className="space-y-4">
          {selectedIncident ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedIncident.number}</CardTitle>
                    <Button 
                      onClick={() => analyzeIncident(selectedIncident)}
                      disabled={isAnalyzing}
                      data-testid="button-analyze-incident"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{selectedIncident.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedIncident.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Priority:</strong>
                      <Badge variant={getPriorityColor(selectedIncident.priority)} className="ml-2">
                        {selectedIncident.priority}
                      </Badge>
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <Badge variant={getStatusColor(selectedIncident.status)} className="ml-2">
                        {selectedIncident.status}
                      </Badge>
                    </div>
                    <div>
                      <strong>Category:</strong> {selectedIncident.category}
                    </div>
                    <div>
                      <strong>Created:</strong> {new Date(selectedIncident.created).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm">
                        {analysis.analysis}
                      </div>
                    </div>
                    
                    {analysis.relevantKB && analysis.relevantKB.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Relevant Knowledge Base Articles:</h4>
                        <div className="space-y-2">
                          {analysis.relevantKB.slice(0, 3).map((kb, index) => (
                            <Card key={index} className="p-3">
                              <h5 className="font-medium text-sm">{kb.title}</h5>
                              <p className="text-xs text-muted-foreground">{kb.category}</p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysis.recommendations && (
                      <div>
                        <h4 className="font-semibold mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Incident</h3>
                <p className="text-muted-foreground">
                  Choose an incident from the list to view details and get AI analysis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}