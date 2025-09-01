import React, { useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../api/api";
import { formatMicropatrons, formatDollars } from "../utils/formatters";

interface LeaderboardProps {
  refreshTrigger?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  refreshTrigger = 0,
}) => {
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
      // Sort by balance descending and take top 5
      const sorted = results.sort((a, b) => b.balance - a.balance).slice(0, 5);
      setTopUsers(sorted);
    } catch (err) {
      setError("Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getTrophyIcon = (position: number) => {
    switch (position) {
      case 0:
        return "🏆";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${position + 1}`;
    }
  };

  const getTrophyStyle = (position: number) => {
    switch (position) {
      case 0:
        return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/25 border-2 border-yellow-300 transform scale-105";
      case 1:
        return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-lg shadow-gray-400/25 border-2 border-gray-200 transform scale-102";
      case 2:
        return "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 border-2 border-orange-300 transform scale-100";
      default:
        return "bg-surfaceTwo border border-subtle hover:border-subtle-hover";
    }
  };

  const getTextStyle = (position: number) => {
    switch (position) {
      case 0:
        return "text-yellow-900";
      case 1:
        return "text-gray-700";
      case 2:
        return "text-orange-900";
      default:
        return "text-emphasis";
    }
  };

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="title-2xl-bold text-emphasis mb-2 flex items-center justify-center gap-3">
          <span className="text-3xl">🏆</span>
          Top Champions
        </h2>
        <p className="body-sm-normal text-secondary">The mighty leaderboard</p>
      </div>

      {loading && (
        <div className="text-center py-12 body-base-normal text-secondary">
          Loading champions...
        </div>
      )}
      {error && (
        <div className="text-center py-12 body-base-normal text-critical">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {topUsers.map((user, index) => (
            <div
              key={user.id}
              className={`relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:transform hover:translate-x-1 ${getTrophyStyle(index)}`}
            >
              {/* Trophy/Medal Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${index < 3 ? "bg-white/20" : "bg-primary/10"} ${index < 3 ? "shadow-inner" : ""}`}
              >
                <span className="text-2xl font-bold">
                  {getTrophyIcon(index)}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <span className={`body-lg-bold ${getTextStyle(index)}`}>
                    {user.username}
                  </span>
                  {index === 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="body-xs-semibold text-yellow-800 bg-yellow-200/50 px-2 py-0.5 rounded-full">
                        👑 CHAMPION
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <span className={`body-lg-bold ${getTextStyle(index)}`}>
                    {formatMicropatrons(user.balance)}
                  </span>
                  <span
                    className={`body-xs-normal ${index < 3 ? getTextStyle(index) + " opacity-80" : "text-secondary"}`}
                  >
                    {formatDollars(user.balance)}
                  </span>
                </div>
              </div>

              {/* Position indicator for top 3 */}
              {index < 3 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="body-xs-bold text-gray-700">
                    #{index + 1}
                  </span>
                </div>
              )}
            </div>
          ))}

          {topUsers.length === 0 && (
            <div className="text-center py-8 body-base-normal text-secondary italic">
              No champions yet. Be the first!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
