import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../utils/api';
import { auth } from '../utils/auth';
import type { Transaction, Account, Category, CreateTransaction } from '../types';

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [newTransaction, setNewTransaction] = useState<CreateTransaction>({
    amount: 0,
    transactionDateTime: new Date().toISOString().slice(0, 16),
    accountId: 0,
    transactionCategoryId: 1,
    transactionType: 'D',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const token = auth.getToken();
      if (!token) return;

      // Fetch all data in parallel
      const [transactionsResponse, accountsResponse, categoriesResponse] = await Promise.all([
        api.get('/user/transactions/fetch' ),
        api.get('/user/accounts/list' ),
        api.get('/categories/transactions' )
      ]);

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data?.transactions || []);
      }

      if (accountsResponse.success) {
        const accountsList = accountsResponse.data?.accounts || [];
        setAccounts(accountsList);
        if (accountsList.length > 0 && newTransaction.accountId === 0) {
          setNewTransaction(prev => ({ ...prev, accountId: accountsList[0].id }));
        }
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = auth.getToken();
      if (!token) return;

      const response = await api.post('/user/transactions/create', newTransaction );
      if (response.success) {
        await fetchData(); // Refresh the list
        setShowCreateForm(false);
        setNewTransaction({
          amount: 0,
          transactionDateTime: new Date().toISOString().slice(0, 16),
          accountId: accounts[0]?.id || 0,
          transactionCategoryId: 1,
          transactionType: 'D',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const filterTransactionsByAccount = (accountId: number | null) => {
    if (accountId === null) return transactions;
    return transactions.filter(t => t.accountId === accountId);
  };

  const getTransactionIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'food':
        return '🍽️';
      case 'transportation':
        return '🚗';
      case 'entertainment':
        return '🎬';
      case 'shopping':
        return '🛍️';
      case 'salary':
        return '💰';
      case 'freelance':
        return '💼';
      case 'investment':
        return '📈';
      default:
        return '💳';
    }
  };

  const getTransactionTypeBg = (type: string) => {
    return type === 'I' ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10';
  };

  const getAmountColor = (type: string) => {
    return type === 'I' ? 'text-green-400' : 'text-red-400';
  };

  const filteredTransactions = filterTransactionsByAccount(selectedAccount);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Loading transactions...</span>
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
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            <span className="text-lg mr-2">+</span>
            Add Transaction
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedAccount(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedAccount === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All Accounts
          </button>
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedAccount === account.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {account.name}
            </button>
          ))}
        </div>

        {/* Create Transaction Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">Add New Transaction</h3>
              <form onSubmit={handleCreateTransaction}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewTransaction(prev => ({ ...prev, transactionType: 'C' }))}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          newTransaction.transactionType === 'C'
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-slate-600 bg-slate-700 text-slate-300'
                        }`}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTransaction(prev => ({ ...prev, transactionType: 'D' }))}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          newTransaction.transactionType === 'D'
                            ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-slate-600 bg-slate-700 text-slate-300'
                        }`}
                      >
                        Expense
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Account
                    </label>
                    <select
                      value={newTransaction.accountId}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, accountId: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newTransaction.transactionCategoryId}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, transactionCategoryId: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newTransaction.transactionDateTime}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, transactionDateTime: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a note about this transaction..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                  >
                    Add Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-white mb-2">No transactions yet</h3>
            <p className="text-slate-400 mb-6">
              {selectedAccount ? 'No transactions for this account' : 'Start tracking your income and expenses'}
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <span className="mr-2">+</span>
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="card hover:shadow-lg transition-shadow duration-200 group">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl ${getTransactionTypeBg(transaction.transactionType)}`}>
                        {getTransactionIcon(transaction.transactionCategoryName)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                          {transaction.description || transaction.transactionCategoryName}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-slate-400 text-sm">
                            {transaction.transactionCategoryName}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 text-sm">
                            {transaction.accountName}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 text-sm">
                            {new Date(transaction.transactionDateTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getAmountColor(transaction.transactionType)}`}>
                        {transaction.transactionType === 'C' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
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
