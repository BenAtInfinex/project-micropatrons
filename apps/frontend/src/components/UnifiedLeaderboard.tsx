import { FC, useState } from "react";
import { Skeleton, SkeletonText } from "@infinex/ui/components";
import { TrophyIcon, WarningIcon } from "@infinex/ui/icons";
import { useUsers, useVictimStats } from "../hooks/queries";
import { formatMicropatrons, formatDollars } from "../utils/formatters";

interface UnifiedLeaderboardProps {
  refreshTrigger?: number; // Keep for compatibility but not used with TanStack Query
}

type TabType = "winners" | "losers";

export const UnifiedLeaderboard: FC<UnifiedLeaderboardProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>("winners");

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const {
    data: victimStats = [],
    isLoading: victimsLoading,
    error: victimsError,
  } = useVictimStats();

  // Sort by balance descending and take top 5
  const topUsers = users.sort((a, b) => b.balance - a.balance).slice(0, 5);
  const topLosers = victimStats.slice(0, 5);

  const isLoading = activeTab === "winners" ? usersLoading : victimsLoading;
  const error = activeTab === "winners" ? usersError : victimsError;

  const getTrophyIcon = (position: number) => {
    if (activeTab === "winners") {
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
    } else {
      switch (position) {
        case 0:
          return "💀";
        case 1:
          return "😵";
        case 2:
          return "😭";
        default:
          return `#${position + 1}`;
      }
    }
  };

  const getTrophyStyle = (position: number) => {
    if (activeTab === "winners") {
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
    } else {
      switch (position) {
        case 0:
          return "bg-gradient-to-br from-critical/20 via-critical/15 to-critical/10 shadow-lg shadow-critical/25 border-2 border-critical/30 transform scale-105";
        case 1:
          return "bg-gradient-to-br from-caution/20 via-caution/15 to-caution/10 shadow-lg shadow-caution/25 border-2 border-caution/30 transform scale-102";
        case 2:
          return "bg-gradient-to-br from-orange-400/20 via-orange-500/15 to-orange-600/10 shadow-lg shadow-orange-500/25 border-2 border-orange-300/30 transform scale-100";
        default:
          return "bg-surfaceTwo border border-subtle hover:border-subtle-hover";
      }
    }
  };

  const getTextStyle = (position: number) => {
    if (activeTab === "winners") {
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
    } else {
      switch (position) {
        case 0:
          return "text-critical";
        case 1:
          return "text-caution";
        case 2:
          return "text-orange-700";
        default:
          return "text-emphasis";
      }
    }
  };

  const renderContent = () => {
    if (activeTab === "winners") {
      return (
        <>
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
                        👑 Biggest Bounty
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
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-surface shadow-lg flex items-center justify-center border-emphasis border">
                  <span className="body-xs-bold text-emphasis">
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
        </>
      );
    } else {
      return (
        <>
          {topLosers.map((victim, index) => (
            <div
              key={victim.username}
              className={`relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:transform hover:translate-x-1 ${getTrophyStyle(index)}`}
            >
              {/* Victim Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${index < 3 ? "bg-white/20" : "bg-critical/10"} ${index < 3 ? "shadow-inner" : ""}`}
              >
                <span className="text-2xl font-bold">
                  {getTrophyIcon(index)}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <span className={`body-lg-bold ${getTextStyle(index)}`}>
                    {victim.username}
                  </span>
                  {index === 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="body-xs-semibold text-critical-800 bg-critical-200/50 px-2 py-0.5 rounded-full">
                        💸 BIGGEST VICTIM
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <span className={`body-lg-bold ${getTextStyle(index)}`}>
                    {victim.victimCount}x got
                  </span>
                  <span
                    className={`body-xs-normal ${index < 3 ? getTextStyle(index) + " opacity-80" : "text-secondary"}`}
                  >
                    -{formatMicropatrons(victim.totalLost)}
                  </span>
                </div>
              </div>

              {/* Position indicator for top 3 */}
              {index < 3 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-surface shadow-lg flex items-center justify-center border-emphasis border">
                  <span className="body-xs-bold text-emphasis">
                    #{index + 1}
                  </span>
                </div>
              )}
            </div>
          ))}

          {topLosers.length === 0 && (
            <div className="text-center py-8 body-base-normal text-secondary italic">
              No victims yet. Stay safe out there!
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-xl">
      {/* Header with Tabs */}
      <div className="text-center mb-8">
        <h2 className="title-2xl-bold text-emphasis mb-4 flex items-center justify-center gap-3">
          {activeTab === "winners" ? (
            <TrophyIcon size="large" />
          ) : (
            <WarningIcon size="large" />
          )}
          Leaderboard
        </h2>

        {/* Tab Navigation */}
        <div className="flex bg-surfaceTwo rounded-xl p-1 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("winners")}
            className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "winners"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-secondary hover:text-emphasis hover:bg-fill"
            }`}
          >
            <TrophyIcon size="small" />
            <span className="body-sm-semibold">Top Spinners</span>
          </button>
          <button
            onClick={() => setActiveTab("losers")}
            className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "losers"
                ? "bg-critical text-white shadow-md"
                : "text-secondary hover:text-emphasis hover:bg-fill"
            }`}
          >
            <WarningIcon size="small" />
            <span className="body-sm-semibold">Top Losers</span>
          </button>
        </div>

        <p className="body-sm-normal text-secondary mt-3">
          {activeTab === "winners"
            ? "From spinning to money"
            : "Most OpSec violations"}
        </p>
      </div>

      {error && (
        <div className="text-center py-12 body-base-normal text-critical">
          Failed to fetch{" "}
          {activeTab === "winners" ? "leaderboard" : "victim stats"}
        </div>
      )}

      <div className="space-y-4">
        {isLoading
          ? // Skeleton loading state
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`relative flex items-center gap-4 p-5 rounded-2xl ${getTrophyStyle(index)}`}
              >
                {/* Trophy/Medal Icon */}
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${index < 3 ? "bg-white/20" : "bg-primary/10"} ${index < 3 ? "shadow-inner" : ""}`}
                >
                  <span className="text-2xl font-bold">
                    {getTrophyIcon(index)}
                  </span>
                </div>

                {/* User Info Skeleton */}
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <Skeleton>
                      <SkeletonText size="lg" width={[0.4, 0.7]} />
                    </Skeleton>
                    {index === 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Skeleton>
                          <SkeletonText size="xs" width={0.5} />
                        </Skeleton>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    <Skeleton>
                      <SkeletonText size="lg" width={0.4} />
                    </Skeleton>
                    <Skeleton className="mt-1">
                      <SkeletonText size="xs" width={0.3} />
                    </Skeleton>
                  </div>
                </div>

                {/* Position indicator for top 3 */}
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-surface shadow-lg flex items-center justify-center border-emphasis border">
                    <span className="body-xs-bold text-emphasis">
                      #{index + 1}
                    </span>
                  </div>
                )}
              </div>
            ))
          : renderContent()}
      </div>
    </div>
  );
};
