import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { api } from '@/utils/api';
import type { Transaction, Account, Category, CreateTransaction } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
        const [transactionsResponse, accountsResponse, categoriesResponse] = await Promise.all([
          api.get('/user/transactions/fetch'),
          api.get('/user/accounts/list'),
          api.get('/categories/transactions')
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

  const getAmountColor = (type: string) => {
    return type === 'C' ? 'text-green-500' : 'text-red-500';
  };

  const filteredTransactions = filterTransactionsByAccount(selectedAccount);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Loading your transactions...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track your income and expenses</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>Add Transaction</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>
                Add a new transaction to track your finances.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTransaction}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Button
                      type="button"
                      variant={newTransaction.transactionType === 'C' ? 'default' : 'outline'}
                      onClick={() => setNewTransaction(prev => ({ ...prev, transactionType: 'C' }))}
                    >
                      Credit
                    </Button>
                    <Button
                      type="button"
                      variant={newTransaction.transactionType === 'D' ? 'default' : 'outline'}
                      onClick={() => setNewTransaction(prev => ({ ...prev, transactionType: 'D' }))}
                    >
                      Debit
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account" className="text-right">
                    Account
                  </Label>
                  <Select
                    value={newTransaction.accountId.toString()}
                    onValueChange={(value) => setNewTransaction(prev => ({ ...prev, accountId: parseInt(value) }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newTransaction.transactionCategoryId.toString()}
                    onValueChange={(value) => setNewTransaction(prev => ({ ...prev, transactionCategoryId: parseInt(value) }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="datetime" className="text-right">
                    Date & Time
                  </Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={newTransaction.transactionDateTime}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, transactionDateTime: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Transaction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <Label>Filter by account:</Label>
        <Select
          value={selectedAccount?.toString() || 'all'}
          onValueChange={(value) => setSelectedAccount(value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
          <p className="text-muted-foreground mb-6">
            {selectedAccount ? 'No transactions for this account' : 'Start tracking your income and expenses'}
          </p>
          <Button onClick={() => setShowCreateForm(true)}>Add Transaction</Button>
        </div>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.description || transaction.transactionCategoryName}</TableCell>
                <TableCell>{transaction.transactionCategoryName}</TableCell>
                <TableCell>{transaction.accountName}</TableCell>
                <TableCell>{new Date(transaction.transactionDateTime).toLocaleDateString()}</TableCell>
                <TableCell className={`text-right font-medium ${getAmountColor(transaction.transactionType)}`}>
                  {transaction.transactionType === 'C' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Layout>
  );
}