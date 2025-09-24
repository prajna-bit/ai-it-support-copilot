import { ActivityFeed } from '../ActivityFeed'

export default function ActivityFeedExample() {
  return (
    <div className="p-4 max-w-md">
      <ActivityFeed limit={5} />
    </div>
  )
}