export interface User {
  id: number;
  username: string;
  balance: number;
}

export interface Activity {
  id: number;
  from_username: string;
  to_username: string;
  amount: number;
  timestamp: string;
}

export interface TransferFormData {
  sender: string;
  receiver: string;
  amount: number;
}

export interface TransferResponse {
  message: string;
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  success: false;
}

export interface OpSecReportData {
  victim: string;
  attacker: string;
  amount: number;
}

export interface OpSecReportResponse {
  message: string;
  success: boolean;
}
