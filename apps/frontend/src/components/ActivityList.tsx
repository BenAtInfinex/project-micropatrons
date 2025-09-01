import { Skeleton, SkeletonText } from "@infinex/ui/components";
import { Activity } from "../types";
import { useActivity } from "../hooks/queries";
import { formatMicropatrons } from "../utils/formatters";
import { ActivityIcon } from "@infinex/ui/icons";

interface ActivityListProps {
  refreshTrigger?: number; // Keep for compatibility but not used with TanStack Query
}

export const ActivityList: React.FC<ActivityListProps> = () => {
  const { data: activities = [], isLoading, error } = useActivity(20); // Show last 20 activities

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="bg-surface rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <ActivityIcon />
        <h2 className="title-lg-semibold text-emphasis">Activity</h2>
      </div>

      {error && (
        <div className="text-center py-8 body-base-normal text-critical">
          Failed to fetch activities
        </div>
      )}

             <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-surfaceTwo border border-subtle rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Skeleton>
                    <SkeletonText size="sm" width={[0.3, 0.5]} />
                  </Skeleton>
                  <span className="text-secondary flex-shrink-0">→</span>
                  <Skeleton>
                    <SkeletonText size="sm" width={[0.3, 0.5]} />
                  </Skeleton>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Skeleton>
                  <SkeletonText size="sm" width={0.4} />
                </Skeleton>
                <Skeleton>
                  <SkeletonText size="xs" width={0.3} />
                </Skeleton>
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="text-center py-8 body-base-normal text-secondary italic">
            No activities yet
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-surfaceTwo border border-subtle rounded-xl p-4 hover:border-subtle-hover transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="body-sm-semibold text-emphasis truncate">
                    {activity.from_username}
                  </span>
                  <span className="text-secondary flex-shrink-0">→</span>
                  <span className="body-sm-semibold text-emphasis truncate">
                    {activity.to_username}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-sm-normal text-primary font-mono">
                  {formatMicropatrons(activity.amount)}
                </span>
                <span className="body-xs-normal text-secondary">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
