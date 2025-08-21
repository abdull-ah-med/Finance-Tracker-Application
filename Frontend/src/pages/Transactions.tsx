import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../utils/api';
import { auth } from '../utils/auth';
import type { Transaction } from '../types';

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = auth.getToken();
        const response = await api.get('/transactions', token);
        if (response.success) {
          setTransactions(response.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      food: '🍔',
      transport: '🚗',
      entertainment: '🎬',
      shopping: '🛍️',
      utilities: '⚡',
      healthcare: '🏥',
      education: '📚',
      salary: '💼',
      investment: '📈',
      other: '📦',
    };
    return categoryIcons[category.toLowerCase()] || '📦';
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-400' : 'text-red-400';
  };

  const getTransactionTypeBg = (type: string) => {
    return type === 'income' ? 'bg-green-900/20 border-green-700/30' : 'bg-red-900/20 border-red-700/30';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Loading your transactions...</span>
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
            <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
            <p className="text-slate-400">Track your income and expenses</p>
          </div>
          <button className="btn-primary">
            <span className="text-lg mr-2">+</span>
            Add Transaction
          </button>
        </div>

        {/* Summary Cards */}
        {transactions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Total Income</h3>
                    <p className="text-2xl font-bold text-green-400">
                      +${transactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-400">
                      -${transactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="text-2xl">💸</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Net Total</h3>
                    <p className={`text-2xl font-bold ${
                      transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      ${transactions
                        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-xl font-semibold text-white mb-2">No transactions yet</h3>
              <p className="text-slate-400 mb-6">
                Add your first transaction to start tracking your finances
              </p>
              <button className="btn-primary">
                <span className="text-lg mr-2">+</span>
                Add Your First Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
              </div>
              
              <div className="divide-y divide-slate-700">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="p-6 hover:bg-slate-700/30 transition-colors duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl ${getTransactionTypeBg(transaction.type)}`}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div>
                          <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {transaction.description}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-slate-400 text-sm capitalize">
                              {transaction.category}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 text-sm">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type === 'income' ? '+' : '-'}$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-900/30 text-green-300 border border-green-700/30' 
                            : 'bg-red-900/30 text-red-300 border border-red-700/30'
                        }`}>
                          {transaction.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {transactions.length > 10 && (
                <div className="p-6 border-t border-slate-700 text-center">
                  <button className="btn-secondary">
                    Load More Transactions
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
