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
  accountCategoryId: number;
  accountCategoryName: string;
  balance: number;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  transactionCategoryId: number;
  transactionCategoryName: string;
  transactionDateTime: string;
  accountId: number;
  accountName: string;
  transactionType: 'C' | 'D'; 
}

export interface Category {
  id: number;
  name: string;
}

export interface CreateTransaction {
  amount: number;
  transactionDateTime: string;
  accountId: number;
  transactionCategoryId: number;
  transactionType: 'C' | 'D';
  description?: string;
}

export interface CreateAccount {
  name: string;
  accountCategoryId: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}
