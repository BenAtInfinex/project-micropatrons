import { FC } from "react";
import { Skeleton, SkeletonText } from "@infinex/ui/components";
import { VictimStats } from "../types";
import { useVictimStats } from "../hooks/queries";
import { formatMicropatrons } from "../utils/formatters";
import { WarningIcon } from "@infinex/ui/icons";

interface TopLosersProps {
  refreshTrigger?: number; // Keep for compatibility but not used with TanStack Query
}

export const TopLosers: FC<TopLosersProps> = () => {
  const { data: victimStats = [], isLoading, error } = useVictimStats();

  // Take top 5 victims
  const topLosers = victimStats.slice(0, 5);

  const getVictimIcon = (position: number) => {
    switch (position) {
      case 0:
        return "💀"; // Skull for #1 victim
      case 1:
        return "😵"; // Dizzy face for #2
      case 2:
        return "😭"; // Crying face for #3
      default:
        return `#${position + 1}`;
    }
  };

  const getVictimStyle = (position: number) => {
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
  };

  const getTextStyle = (position: number) => {
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
  };

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="title-2xl-bold text-emphasis mb-2 flex items-center justify-center gap-3">
          <WarningIcon size="large" />
          Top Losers
        </h2>
        <p className="body-sm-normal text-secondary">Most OpSec violations</p>
      </div>

      {error && (
        <div className="text-center py-12 body-base-normal text-critical">
          Failed to fetch victim stats
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`relative flex items-center gap-4 p-5 rounded-2xl ${getVictimStyle(index)}`}
            >
              {/* Victim Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${index < 3 ? "bg-white/20" : "bg-critical/10"} ${index < 3 ? "shadow-inner" : ""}`}
              >
                <span className="text-2xl font-bold">
                  {getVictimIcon(index)}
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
                        <SkeletonText size="xs" width={0.6} />
                      </Skeleton>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <Skeleton>
                    <SkeletonText size="lg" width={0.3} />
                  </Skeleton>
                  <Skeleton className="mt-1">
                    <SkeletonText size="xs" width={0.4} />
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
        ) : (
          <>
            {topLosers.map((victim, index) => (
              <div
                key={victim.username}
                className={`relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:transform hover:translate-x-1 ${getVictimStyle(index)}`}
              >
                {/* Victim Icon */}
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${index < 3 ? "bg-white/20" : "bg-critical/10"} ${index < 3 ? "shadow-inner" : ""}`}
                >
                  <span className="text-2xl font-bold">
                    {getVictimIcon(index)}
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
        )}
      </div>
    </div>
  );
};
