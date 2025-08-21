import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../utils/api';
import { auth } from '../utils/auth';
import type { Account } from '../types';

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = auth.getToken();
        const response = await api.get('/accounts', token);
        if (response.success) {
          setAccounts(response.accounts);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit':
        return '💳';
      case 'investment':
        return '📈';
      default:
        return '💼';
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-400';
    if (balance < 0) return 'text-red-400';
    return 'text-slate-300';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Loading your accounts...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Accounts</h1>
            <p className="text-slate-400">Manage and track your financial accounts</p>
          </div>
          <button className="btn-primary">
            <span className="text-lg mr-2">+</span>
            Add Account
          </button>
        </div>

        {/* Summary Card */}
        {accounts.length > 0 && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-slate-300 mb-1">Total Balance</h3>
                  <p className={`text-3xl font-bold ${getBalanceColor(getTotalBalance())}`}>
                    ${getTotalBalance().toFixed(2)}
                  </p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-6xl mb-4">🏦</div>
              <h3 className="text-xl font-semibold text-white mb-2">No accounts yet</h3>
              <p className="text-slate-400 mb-6">
                Create your first account to start tracking your finances
              </p>
              <button className="btn-primary">
                <span className="text-lg mr-2">+</span>
                Create Your First Account
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div 
                key={account.id} 
                className="card hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-xl">
                        {getAccountTypeIcon(account.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {account.name}
                        </h3>
                        <p className="text-slate-400 text-sm capitalize">{account.type}</p>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-slate-300 transition-colors">
                      <span className="text-lg">⋯</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Balance</span>
                      <span className={`text-xl font-bold ${getBalanceColor(account.balance)}`}>
                        ${account.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex space-x-2">
                      <button className="btn-secondary text-xs py-1.5 px-3 flex-1">
                        View Details
                      </button>
                      <button className="btn-secondary text-xs py-1.5 px-3 flex-1">
                        Add Transaction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
