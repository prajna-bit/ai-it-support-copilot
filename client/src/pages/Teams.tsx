import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Mail, Phone, Calendar, Clock } from "lucide-react"

export default function Teams() {
  const teamMembers = [
    {
      id: "1",
      name: "Sarah Chen",
      role: "Senior IT Support Engineer",
      email: "sarah.chen@company.com",
      phone: "+1 (555) 123-4567",
      status: "online",
      expertise: ["Windows", "Network", "Hardware"],
      currentLoad: 3,
      maxCapacity: 8
    },
    {
      id: "2", 
      name: "Mike Johnson",
      role: "IT Support Specialist",
      email: "mike.johnson@company.com",
      phone: "+1 (555) 234-5678",
      status: "busy",
      expertise: ["Email", "Software", "Mac"],
      currentLoad: 6,
      maxCapacity: 8
    },
    {
      id: "3",
      name: "Alex Rodriguez",
      role: "Network Administrator", 
      email: "alex.rodriguez@company.com",
      phone: "+1 (555) 345-6789",
      status: "away",
      expertise: ["Network", "Security", "Infrastructure"],
      currentLoad: 2,
      maxCapacity: 6
    },
    {
      id: "4",
      name: "Emily Davis",
      role: "Help Desk Coordinator",
      email: "emily.davis@company.com", 
      phone: "+1 (555) 456-7890",
      status: "online",
      expertise: ["General Support", "Training", "Documentation"],
      currentLoad: 4,
      maxCapacity: 10
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "busy": return "bg-yellow-500"
      case "away": return "bg-gray-500"
      default: return "bg-gray-300"
    }
  }

  const getLoadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 80) return "destructive"
    if (percentage >= 60) return "default"
    return "secondary"
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">IT Support Team</h1>
          <p className="text-muted-foreground">Manage team members and track workload distribution</p>
        </div>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Busy</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold">15</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Load</p>
                <p className="text-2xl font-bold">47%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover-elevate" data-testid={`team-member-${member.id}`}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div 
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <Badge 
                    variant={getLoadColor(member.currentLoad, member.maxCapacity)}
                    className="mt-1"
                  >
                    {member.currentLoad}/{member.maxCapacity} cases
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Expertise:</p>
                <div className="flex gap-1 flex-wrap">
                  {member.expertise.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Current Workload</span>
                  <span>{Math.round((member.currentLoad / member.maxCapacity) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (member.currentLoad / member.maxCapacity) >= 0.8 ? 'bg-red-500' :
                      (member.currentLoad / member.maxCapacity) >= 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(member.currentLoad / member.maxCapacity) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}