import { ChatMessage } from '../ChatMessage'

export default function ChatMessageExample() {
  return (
    <div className="p-4 space-y-4 max-w-4xl">
      <ChatMessage
        id="1"
        role="user"
        content="How do I troubleshoot database connection timeouts?"
        timestamp={new Date()}
      />
      <ChatMessage
        id="2"
        role="assistant"
        content="Database connection timeouts can occur due to several reasons. Here are the most common causes and solutions:

1. **Network Issues**: Check if there are network connectivity problems between your application and database server.

2. **Connection Pool Exhaustion**: Verify your connection pool settings and ensure connections are being properly released.

3. **Database Server Load**: Monitor your database server's CPU and memory usage to identify performance bottlenecks."
        timestamp={new Date()}
        sources={[
          { title: "Database Troubleshooting Guide", relevance: 0.95 },
          { title: "Connection Pool Best Practices", relevance: 0.87 }
        ]}
        onFeedback={(id, feedback) => console.log('Feedback:', id, feedback)}
        onRetry={(id) => console.log('Retry:', id)}
      />
      <ChatMessage
        id="3"
        role="assistant"
        content=""
        timestamp={new Date()}
        isLoading={true}
      />
    </div>
  )
}