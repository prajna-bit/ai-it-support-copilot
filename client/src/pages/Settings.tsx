import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings as SettingsIcon, Save, RefreshCw, Database, Bot, Bell, Shield } from "lucide-react"

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      desktopNotifications: false,
      incidentEscalation: true,
      weeklyReports: true
    },
    ai: {
      enableFallback: true,
      autoAnalysis: true,
      knowledgeBaseIntegration: true,
      responseTime: "fast"
    },
    system: {
      autoRefresh: 30,
      maxIncidents: 100,
      sessionTimeout: 60,
      logLevel: "info"
    },
    integration: {
      servicenowUrl: "demo.servicenow.com",
      apiTimeout: 30,
      retryAttempts: 3
    }
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simulate save operation
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 1000)
  }

  const handleReset = () => {
    if (confirm("Reset all settings to default values?")) {
      setSettings({
        notifications: {
          emailAlerts: true,
          desktopNotifications: false, 
          incidentEscalation: true,
          weeklyReports: true
        },
        ai: {
          enableFallback: true,
          autoAnalysis: true,
          knowledgeBaseIntegration: true,
          responseTime: "fast"
        },
        system: {
          autoRefresh: 30,
          maxIncidents: 100,
          sessionTimeout: 60,
          logLevel: "info"
        },
        integration: {
          servicenowUrl: "demo.servicenow.com",
          apiTimeout: 30,
          retryAttempts: 3
        }
      })
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Configure your AI Support Assistant</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} data-testid="button-reset-settings">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* AI & Intelligence Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI & Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable AI Fallback System</Label>
              <p className="text-sm text-muted-foreground">Use local AI when OpenAI is unavailable</p>
            </div>
            <Switch 
              checked={settings.ai.enableFallback}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, ai: { ...prev.ai, enableFallback: checked }}))}
              data-testid="switch-ai-fallback"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Automatic Incident Analysis</Label>
              <p className="text-sm text-muted-foreground">Analyze incidents automatically on creation</p>
            </div>
            <Switch 
              checked={settings.ai.autoAnalysis}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, ai: { ...prev.ai, autoAnalysis: checked }}))}
              data-testid="switch-auto-analysis"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Knowledge Base Integration</Label>
              <p className="text-sm text-muted-foreground">Include KB articles in AI responses</p>
            </div>
            <Switch 
              checked={settings.ai.knowledgeBaseIntegration}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, ai: { ...prev.ai, knowledgeBaseIntegration: checked }}))}
              data-testid="switch-kb-integration"
            />
          </div>

          <div className="space-y-2">
            <Label>AI Response Speed</Label>
            <select 
              value={settings.ai.responseTime}
              onChange={(e) => setSettings(prev => ({ ...prev, ai: { ...prev.ai, responseTime: e.target.value }}))}
              className="w-full p-2 border rounded"
              data-testid="select-response-speed"
            >
              <option value="fast">Fast (Local fallback)</option>
              <option value="balanced">Balanced (OpenAI + fallback)</option>
              <option value="accurate">Accurate (OpenAI only)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive email notifications for critical incidents</p>
            </div>
            <Switch 
              checked={settings.notifications.emailAlerts}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, emailAlerts: checked }}))}
              data-testid="switch-email-alerts"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">Show browser notifications for new incidents</p>
            </div>
            <Switch 
              checked={settings.notifications.desktopNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, desktopNotifications: checked }}))}
              data-testid="switch-desktop-notifications"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Incident Escalation Alerts</Label>
              <p className="text-sm text-muted-foreground">Notify when incidents need escalation</p>
            </div>
            <Switch 
              checked={settings.notifications.incidentEscalation}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, incidentEscalation: checked }}))}
              data-testid="switch-escalation-alerts"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Auto Refresh Interval (seconds)</Label>
              <Input
                type="number"
                value={settings.system.autoRefresh}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  system: { ...prev.system, autoRefresh: parseInt(e.target.value) }
                }))}
                data-testid="input-auto-refresh"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Max Incidents to Display</Label>
              <Input
                type="number"
                value={settings.system.maxIncidents}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  system: { ...prev.system, maxIncidents: parseInt(e.target.value) }
                }))}
                data-testid="input-max-incidents"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.system.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  system: { ...prev.system, sessionTimeout: parseInt(e.target.value) }
                }))}
                data-testid="input-session-timeout"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Log Level</Label>
              <select 
                value={settings.system.logLevel}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  system: { ...prev.system, logLevel: e.target.value }
                }))}
                className="w-full p-2 border rounded"
                data-testid="select-log-level"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <Badge variant="secondary" className="mb-2">ServiceNow</Badge>
              <p className="text-sm text-muted-foreground">Simulation Active</p>
            </div>
            <div className="text-center p-4 border rounded">
              <Badge variant="secondary" className="mb-2">Knowledge Base</Badge>
              <p className="text-sm text-muted-foreground">6 Articles Loaded</p>
            </div>
            <div className="text-center p-4 border rounded">
              <Badge variant="secondary" className="mb-2">AI System</Badge>
              <p className="text-sm text-muted-foreground">Fallback Ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}