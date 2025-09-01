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
    <div className="activity-list">
      <h2>Recent Activity</h2>
      
      {loading && <div className="loading">Loading activities...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && activities.length === 0 && (
        <div className="no-activity">No activities yet</div>
      )}
      
      {!loading && !error && activities.length > 0 && (
        <div className="activities">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-main">
                <span className="activity-from">{activity.from_username}</span>
                <span className="activity-arrow">→</span>
                <span className="activity-to">{activity.to_username}</span>
              </div>
              <div className="activity-details">
                <span className="activity-amount">{formatMicropatrons(activity.amount)}</span>
                <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
