import React, { useState } from "react";
import { UserList } from "../components/UserList";
import { ActivityList } from "../components/ActivityList";
import { Leaderboard } from "../components/Leaderboard";
import { OpSecReportModal } from "../components/OpSecReportModal";

export function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isOpSecModalOpen, setIsOpSecModalOpen] = useState(false);

  const handleDataRefresh = () => {
    // Increment trigger to force all components to refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpSecReportSuccess = () => {
    handleDataRefresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface/50 backdrop-blur-md border-b border-subtle sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="title-xl-semibold text-emphasis">💰 Micropatrons</h1>
          <p className="body-base-normal text-secondary mt-1">Community currency transfer system</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Activity */}
          <div className="lg:col-span-3">
            <ActivityList refreshTrigger={refreshTrigger} />
          </div>

          {/* Center - Leaderboard */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {/* Main Leaderboard */}
              <Leaderboard refreshTrigger={refreshTrigger} />
              
              {/* OpSec Report CTA */}
              <div className="bg-surface rounded-3xl p-6 text-center">
                <div className="mb-4">
                  <span className="text-3xl mb-2 block">⚠️</span>
                  <h3 className="title-base-bold text-emphasis mb-2">Security Issue?</h3>
                  <p className="body-sm-normal text-secondary">
                    Report OpSec violations and help maintain community standards
                  </p>
                </div>
                <button
                  onClick={() => setIsOpSecModalOpen(true)}
                  className="px-6 py-3 bg-critical text-white rounded-xl body-base-semibold hover:bg-critical-hover active:bg-critical-pressed transition-all shadow-lg"
                >
                  Report OpSec Issue
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - All Users */}
          <div className="lg:col-span-3">
            <UserList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>

      {/* OpSec Report Modal */}
      <OpSecReportModal
        isOpen={isOpSecModalOpen}
        onClose={() => setIsOpSecModalOpen(false)}
        onReportSuccess={handleOpSecReportSuccess}
      />
    </div>
  );
}
