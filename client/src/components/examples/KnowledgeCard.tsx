import { KnowledgeCard } from '../KnowledgeCard'

export default function KnowledgeCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <KnowledgeCard
        id="KB-001"
        title="Database Connection Troubleshooting"
        content="This guide covers common database connection issues including timeout errors, connection pool exhaustion, and network connectivity problems. Learn how to diagnose and resolve these issues step by step."
        category="Database"
        tags={["MySQL", "PostgreSQL", "Troubleshooting", "Performance"]}
        relevanceScore={0.95}
        updatedAt={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        onClick={(id) => console.log('Knowledge clicked:', id)}
        onOpenExternal={(id) => console.log('Opening external:', id)}
      />
      <KnowledgeCard
        id="KB-002"
        title="VPN Setup and Configuration"
        content="Complete guide for setting up VPN connections for remote workers. Includes client configuration, troubleshooting common issues, and security best practices."
        category="Network"
        tags={["VPN", "Security", "Remote Work"]}
        relevanceScore={0.72}
        updatedAt={new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)}
        onClick={(id) => console.log('Knowledge clicked:', id)}
        onOpenExternal={(id) => console.log('Opening external:', id)}
      />
      <KnowledgeCard
        id="KB-003"
        title="Email Client Configuration"
        content="Step-by-step instructions for configuring email clients including Outlook, Thunderbird, and mobile devices."
        category="Email"
        tags={["Outlook", "IMAP", "SMTP"]}
        updatedAt={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        onClick={(id) => console.log('Knowledge clicked:', id)}
        onOpenExternal={(id) => console.log('Opening external:', id)}
      />
    </div>
  )
}