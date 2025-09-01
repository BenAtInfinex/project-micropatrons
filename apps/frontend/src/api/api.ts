import {
  User,
  TransferFormData,
  TransferResponse,
  ErrorResponse,
  Activity,
} from "../types";

const API_BASE_URL = "http://localhost:5173/api";

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
};
