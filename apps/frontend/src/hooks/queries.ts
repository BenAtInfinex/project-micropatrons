import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { User, Activity, TransferFormData, VictimStats } from "../types";

// Query keys for cache management
export const queryKeys = {
  users: ["users"] as const,
  userSearch: (search?: string) => ["users", "search", search] as const,
  user: (username: string) => ["users", username] as const,
  activity: (limit?: number, offset?: number) => ["activity", limit, offset] as const,
  userActivity: (username: string, limit?: number, offset?: number) => 
    ["users", username, "activity", limit, offset] as const,
  activityStats: (days?: number) => ["activity", "stats", days] as const,
  victimStats: ["victims", "stats"] as const,
};

// Users queries
export function useUsers(search?: string) {
  return useQuery({
    queryKey: queryKeys.userSearch(search),
    queryFn: () => api.getUsers(search),
    staleTime: 1000 * 60 * 2, // 2 minutes for user list
  });
}

export function useUser(username: string) {
  return useQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => api.getUser(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes for individual users
  });
}

// Activity queries
export function useActivity(limit = 50, offset = 0) {
  return useQuery({
    queryKey: queryKeys.activity(limit, offset),
    queryFn: () => api.getActivity(limit, offset),
    staleTime: 1000 * 30, // 30 seconds for activity (more frequent updates)
  });
}

export function useUserActivity(username: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: queryKeys.userActivity(username, limit, offset),
    queryFn: () => api.getUserActivity(username, limit, offset),
    enabled: !!username,
    staleTime: 1000 * 30, // 30 seconds for user activity
  });
}

export function useActivityStats(days = 30) {
  return useQuery({
    queryKey: queryKeys.activityStats(days),
    queryFn: () => api.getActivityStats(days),
    staleTime: 1000 * 60 * 5, // 5 minutes for stats
  });
}

export function useVictimStats() {
  return useQuery({
    queryKey: queryKeys.victimStats,
    queryFn: () => api.getVictimStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes for victim stats
  });
}

// Mutations
export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferFormData) => api.transfer(data),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity() });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityStats() });
    },
  });
}

export function useReportOpSecIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { victim: string; attacker: string }) => api.reportOpSecIssue(data),
    onSuccess: () => {
      // Invalidate and refetch related queries after OpSec report
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity() });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityStats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.victimStats });
    },
  });
}

// Utility hook for manual refetch
export function useRefreshData() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users });
    queryClient.invalidateQueries({ queryKey: queryKeys.activity() });
    queryClient.invalidateQueries({ queryKey: queryKeys.activityStats() });
    queryClient.invalidateQueries({ queryKey: queryKeys.victimStats });
  };
}
