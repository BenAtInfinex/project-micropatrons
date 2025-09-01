import { useState } from "react";
import { UserList } from "../components/UserList";
import { ActivityList } from "../components/ActivityList";
import { UnifiedLeaderboard } from "../components/UnifiedLeaderboard";
import { OpSecReportModal } from "../components/OpSecReportModal";

export function Dashboard() {
  const [isOpSecModalOpen, setIsOpSecModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface/50 backdrop-blur-md border-b border-subtle sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="title-xl-semibold text-emphasis">🔐 OpSecRun</h1>
          <p className="body-base-normal text-secondary mt-1">
            Rest in peace spinning...
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero OpSec Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-critical/10 via-critical/5 to-caution/10 rounded-3xl p-8 border border-critical/20 shadow-xl">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-critical/20 rounded-full mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="title-2xl-bold text-emphasis mb-1">
                  Report OpSec Violations
                </h2>
                <p className="body-lg-normal text-secondary mb-2">
                  u or µ both work.
                </p>
              </div>

              <button
                onClick={() => setIsOpSecModalOpen(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-critical text-white rounded-2xl title-base-semibold hover:bg-critical-hover active:bg-critical-pressed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="text-xl">🚨</span>
                Report OpSec Issue
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Section - Leaderboard (takes center stage) */}
          <div className="xl:col-span-2">
            <UnifiedLeaderboard />
          </div>

          {/* Right Section - Activity & Users */}
          <div className="xl:col-span-1 space-y-8">
            {/* Recent Activity */}
            <div>
              <ActivityList />
            </div>

            {/* All Users */}
            <div>
              <UserList />
            </div>
          </div>
        </div>
      </main>

      {/* OpSec Report Modal */}
      <OpSecReportModal
        isOpen={isOpSecModalOpen}
        onClose={() => setIsOpSecModalOpen(false)}
      />
    </div>
  );
}
