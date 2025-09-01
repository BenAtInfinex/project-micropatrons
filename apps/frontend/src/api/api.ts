import {
  User,
  TransferFormData,
  TransferResponse,
  ErrorResponse,
  Activity,
  VictimStats,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5173/api";

export const api = {
  async getUsers(search?: string): Promise<User[]> {
    const url = new URL(`${API_BASE_URL}/users`);
    if (search) {
      url.searchParams.append("search", search);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  },

  async getUser(username: string): Promise<User> {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(username)}`,
    );
    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || "Failed to fetch user");
    }
    return response.json();
  },

  async transfer(data: TransferFormData): Promise<TransferResponse> {
    const response = await fetch(`${API_BASE_URL}/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || "Transfer failed");
    }

    return response.json();
  },

  async getActivity(limit = 50, offset = 0): Promise<Activity[]> {
    const response = await fetch(
      `${API_BASE_URL}/activity?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch activity");
    }
    return response.json();
  },

  async getUserActivity(
    username: string,
    limit = 50,
    offset = 0,
  ): Promise<Activity[]> {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(username)}/activity?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user activity");
    }
    return response.json();
  },

  async getActivityStats(
    days = 30,
  ): Promise<{ date: string; transfers: number; volume: number }[]> {
    // Mock data for now since the backend doesn't have this endpoint yet
    const stats = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toISOString().split("T")[0],
        transfers: Math.floor(Math.random() * 20) + 5,
        volume: Math.floor(Math.random() * 1000000) + 100000,
      });
    }

    return Promise.resolve(stats);
  },

  async getVictimStats(): Promise<VictimStats[]> {
    // Get all activity to analyze OpSec violations
    const allActivity = await this.getActivity(1000, 0); // Get a large number of activities
    
    // OpSec violations are transfers of exactly 20,000 µPatrons
    const opSecViolations = allActivity.filter(activity => activity.amount === 20000);
    
    // Count victims (from_username in OpSec penalty transfers)
    const victimCounts = new Map<string, { count: number; totalLost: number }>();
    
    opSecViolations.forEach(violation => {
      const victim = violation.from_username;
      const current = victimCounts.get(victim) || { count: 0, totalLost: 0 };
      victimCounts.set(victim, {
        count: current.count + 1,
        totalLost: current.totalLost + violation.amount
      });
    });
    
    // Convert to array and sort by victim count descending
    const victimStats: VictimStats[] = Array.from(victimCounts.entries()).map(([username, stats]) => ({
      username,
      victimCount: stats.count,
      totalLost: stats.totalLost
    })).sort((a, b) => b.victimCount - a.victimCount);
    
    return victimStats;
  },

  async reportOpSecIssue(data: {
    victim: string;
    attacker: string;
  }): Promise<{ message: string; success: boolean }> {
    // This will transfer 20,000 micropatrons from attacker to victim
    const transferData = {
      sender: data.victim,
      receiver: data.attacker,
      amount: 20000,
    };

    const response = await fetch(`${API_BASE_URL}/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || "OpSec report failed");
    }

    const result = await response.json();
    return {
      message: `OpSec issue reported successfully. ${data.attacker} has been penalized 20,000 µPatrons which have been transferred to ${data.victim}.`,
      success: true,
    };
  },
};
