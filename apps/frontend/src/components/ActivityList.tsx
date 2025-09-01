import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { api } from '../api/api';
import { formatMicropatrons } from '../utils/formatters';

interface ActivityListProps {
  refreshTrigger: number;
}

export const ActivityList: React.FC<ActivityListProps> = ({ refreshTrigger }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [refreshTrigger]);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await api.getActivity(20); // Show last 20 activities
      setActivities(results);
    } catch (err) {
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-surface rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">📊</span>
        <h2 className="title-lg-semibold text-emphasis">Activity</h2>
      </div>
      
      {loading && <div className="text-center py-8 body-base-normal text-secondary">Loading activities...</div>}
      {error && <div className="text-center py-8 body-base-normal text-critical">{error}</div>}
      
      {!loading && !error && activities.length === 0 && (
        <div className="text-center py-8 body-base-normal text-secondary italic">No activities yet</div>
      )}
      
      {!loading && !error && activities.length > 0 && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-surfaceTwo border border-subtle rounded-xl p-4 hover:border-subtle-hover transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="body-sm-semibold text-emphasis truncate">{activity.from_username}</span>
                  <span className="text-secondary flex-shrink-0">→</span>
                  <span className="body-sm-semibold text-emphasis truncate">{activity.to_username}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-sm-normal text-primary font-mono">{formatMicropatrons(activity.amount)}</span>
                <span className="body-xs-normal text-secondary">{formatTimestamp(activity.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
