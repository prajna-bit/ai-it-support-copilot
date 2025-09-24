import { StatusIndicator } from '../StatusIndicator'

export default function StatusIndicatorExample() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <StatusIndicator status="online" />
        <StatusIndicator status="offline" />
        <StatusIndicator status="degraded" />
        <StatusIndicator status="maintenance" />
      </div>
      <div className="flex gap-4">
        <StatusIndicator status="online" showText={false} />
        <StatusIndicator status="offline" showText={false} />
        <StatusIndicator status="degraded" showText={false} />
        <StatusIndicator status="maintenance" showText={false} />
      </div>
    </div>
  )
}