export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User | null;
}

export interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  userId: number;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  accountId: number;
  type: 'income' | 'expense';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}
