export interface User {
  id: string; // UUID
  username: string;
  balance: number;
  created_at: string;
}

export interface Activity {
  id: string; // UUID
  from_user_id: string;
  to_user_id: string;
  amount: number;
  timestamp: string;
  from_username?: string;
  to_username?: string;
  type?: 'sent' | 'received';
}

export interface TransferFormData {
  sender: string;
  receiver: string;
  amount: number;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  sender?: User;
  receiver?: User;
  activity?: Activity;
}

export interface ErrorResponse {
  error: string;
}
