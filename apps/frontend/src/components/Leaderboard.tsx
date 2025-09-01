import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/api';
import { formatMicropatrons, formatDollars } from '../utils/formatters';

interface LeaderboardProps {
  refreshTrigger: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ refreshTrigger }) => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopUsers();
  }, [refreshTrigger]);

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
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      
      {loading && <div className="loading">Loading leaderboard...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && (
        <div className="leaderboard-list">
          {topUsers.map((user, index) => (
            <div 
              key={user.id} 
              className={`leaderboard-item ${index < 3 ? `top-${index + 1}` : ''}`}
            >
              <div className="rank">{getMedalEmoji(index)}</div>
              <div className="user-info">
                <span className="username">{user.username}</span>
                <div className="balance-info">
                  <span className="micropatrons">{formatMicropatrons(user.balance)}</span>
                  <span className="dollars">{formatDollars(user.balance)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
