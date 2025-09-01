import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/api';
import { formatMicropatrons, formatDollars } from '../utils/formatters';

export const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await api.getUsers();
      // Sort by balance descending and take top 10
      const sorted = results.sort((a, b) => b.balance - a.balance).slice(0, 10);
      setTopUsers(sorted);
    } catch (err) {
      setError('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${position + 1}`;
    }
  };

  return (
    <div className="bg-surface rounded-3xl p-6">
      <h2 className="title-lg-semibold text-emphasis mb-6 flex items-center gap-2">
        <span>🏆</span> Leaderboard
      </h2>
      
      {loading && <div className="text-center py-8 body-base-normal text-secondary">Loading leaderboard...</div>}
      {error && <div className="text-center py-8 body-base-normal text-negative">{error}</div>}
      
      {!loading && !error && (
        <div className="space-y-3">
          {topUsers.map((user, index) => (
            <div 
              key={user.id} 
              className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:transform hover:translate-x-1 ${
                index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400' :
                index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400' :
                index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400' :
                'bg-surfaceTwo border border-subtle hover:border-subtle-hover'
              }`}
            >
              <div className="title-lg-semibold min-w-[50px] text-center">
                {getMedalEmoji(index)}
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className="body-base-semibold text-emphasis">{user.username}</span>
                <div className="flex flex-col items-end">
                  <span className="body-base-semibold text-primary">{formatMicropatrons(user.balance)}</span>
                  <span className="body-xs-normal text-secondary">{formatDollars(user.balance)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
