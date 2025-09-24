import { IncidentCard } from '../IncidentCard'

export default function IncidentCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <IncidentCard
        id="INC-001"
        title="Database Connection Timeout"
        description="Production database experiencing intermittent connection timeouts affecting user authentication and data retrieval operations."
        priority="critical"
        status="open"
        category="Database"
        assignedTo={{ name: "Sarah Chen" }}
        createdAt={new Date(Date.now() - 30 * 60 * 1000)}
        updatedAt={new Date(Date.now() - 5 * 60 * 1000)}
        onClick={(id) => console.log('Incident clicked:', id)}
      />
      <IncidentCard
        id="INC-002"
        title="Email Server Connectivity"
        description="Users unable to send emails through Outlook client"
        priority="high"
        status="in_progress"
        category="Email"
        assignedTo={{ name: "Mike Johnson" }}
        createdAt={new Date(Date.now() - 2 * 60 * 60 * 1000)}
        updatedAt={new Date(Date.now() - 15 * 60 * 1000)}
        onClick={(id) => console.log('Incident clicked:', id)}
      />
      <IncidentCard
        id="INC-003"
        title="Printer Not Working"
        description="Floor 3 printer showing offline status"
        priority="low"
        status="resolved"
        category="Hardware"
        createdAt={new Date(Date.now() - 24 * 60 * 60 * 1000)}
        updatedAt={new Date(Date.now() - 60 * 60 * 1000)}
        onClick={(id) => console.log('Incident clicked:', id)}
      />
    </div>
  )
}