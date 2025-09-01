import React, { useState } from "react";
import { TransferForm } from "../components/TransferForm";
import { UserList } from "../components/UserList";
import { ActivityList } from "../components/ActivityList";
import { Leaderboard } from "../components/Leaderboard";
import { BalanceChart } from "../components/BalanceChart";
import { ActivityChart } from "../components/ActivityChart";

export function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransferComplete = () => {
    // Increment trigger to force UserList and ActivityList to refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface/50 backdrop-blur-md border-b border-subtle sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="title-xl-semibold text-emphasis">💰 Micropatrons</h1>
          <p className="body-base-normal text-secondary mt-1">Transfer currency between users</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Top Section - Leaderboard and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <BalanceChart refreshTrigger={refreshTrigger} />
            <ActivityChart refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Middle Section - Transfer and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TransferForm onTransferComplete={handleTransferComplete} />
          <ActivityList refreshTrigger={refreshTrigger} />
        </div>

        {/* Bottom Section - User List */}
        <UserList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}
