import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import type { Account, Transfer } from '../types';

interface CreateTransferForm {
  amount: string;
  fromAccountId: string;
  toAccountId: string;
  description: string;
  transferDateTime: string;
}

export const Transfers: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTransferForm>({
    amount: '',
    fromAccountId: '',
    toAccountId: '',
    description: '',
    transferDateTime: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchTransfers();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/user/accounts/list');
      if (response.success) {
        setAccounts(response.data?.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to fetch accounts');
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await api.get('/transfer');
      if (response.success) {
        // Ensure transfers are sorted by date descending (latest first)
        const sortedTransfers = (response.data?.transfers || [])
          .sort((a: Transfer, b: Transfer) => new Date(b.transferDateTime).getTime() - new Date(a.transferDateTime).getTime());
        setTransfers(sortedTransfers);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setError('Failed to fetch transfers');
    }
  };

  const handleInputChange = (field: keyof CreateTransferForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid transfer amount');
      return false;
    }
    if (!formData.fromAccountId) {
      setError('Please select a source account');
      return false;
    }
    if (!formData.toAccountId) {
      setError('Please select a destination account');
      return false;
    }
    if (formData.fromAccountId === formData.toAccountId) {
      setError('Source and destination accounts must be different');
      return false;
    }
    if (!formData.transferDateTime) {
      setError('Please select a transfer date and time');
      return false;
    }

    // Check if source account has sufficient balance
    const sourceAccount = accounts.find(acc => acc.id === parseInt(formData.fromAccountId));
    if (sourceAccount && parseFloat(formData.amount) > sourceAccount.balance) {
      setError('Insufficient balance in source account');
      return false;
    }

    return true;
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transferData = {
        amount: parseFloat(formData.amount),
        fromAccountId: parseInt(formData.fromAccountId),
        toAccountId: parseInt(formData.toAccountId),
        description: formData.description,
        transferDateTime: new Date(formData.transferDateTime).toISOString(),
      };

      const response = await api.post('/transfer', transferData);

      if (response.data.success) {
        setSuccess('Transfer completed successfully!');
        setFormData({
          amount: '',
          fromAccountId: '',
          toAccountId: '',
          description: '',
          transferDateTime: new Date().toISOString().slice(0, 16),
        });
        setIsDialogOpen(false);
        
        // Refresh data
        await Promise.all([fetchAccounts(), fetchTransfers()]);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || 'Failed to create transfer');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred while creating the transfer');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };



  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Account Transfers</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Transfer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Transfer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromAccount">From Account</Label>
                    <Select
                      value={formData.fromAccountId}
                      onValueChange={(value) => handleInputChange('fromAccountId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account">
                          {formData.fromAccountId ? (
                            (() => {
                              const account = accounts.find(a => a.id.toString() === formData.fromAccountId);
                              return account ? `${account.name} (${formatCurrency(account.balance)})` : 'Select source account';
                            })()
                          ) : (
                            'Select source account'
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name} ({formatCurrency(account.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toAccount">To Account</Label>
                    <Select
                      value={formData.toAccountId}
                      onValueChange={(value) => handleInputChange('toAccountId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account">
                          {formData.toAccountId ? (
                            (() => {
                              const account = accounts.find(a => a.id.toString() === formData.toAccountId);
                              return account ? `${account.name} (${formatCurrency(account.balance)})` : 'Select destination account';
                            })()
                          ) : (
                            'Select destination account'
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          .filter(account => account.id.toString() !== formData.fromAccountId)
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.name} ({formatCurrency(account.balance)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferDateTime">Transfer Date & Time</Label>
                  <Input
                    id="transferDateTime"
                    type="datetime-local"
                    value={formData.transferDateTime}
                    onChange={(e) => handleInputChange('transferDateTime', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Transfer description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Transfer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        {error && !isDialogOpen && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
          </CardHeader>
          <CardContent>
            {transfers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transfers found. Create your first transfer to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>From Account</TableHead>
                    <TableHead>To Account</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">
                        {transfer.description || 'Account Transfer'}
                      </TableCell>
                      <TableCell>{transfer.fromAccountName}</TableCell>
                      <TableCell>{transfer.toAccountName}</TableCell>
                      <TableCell>{new Date(transfer.transferDateTime).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        {formatCurrency(transfer.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {transfer.referenceNumber}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
