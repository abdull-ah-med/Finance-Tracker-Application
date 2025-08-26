import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { api } from "@/utils/api";
import { exportAccountsToPDF } from "@/utils/pdfExport";
import type { Account, Category, CreateAccount } from "@/types";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, PiggyBank, Building } from "lucide-react";

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccount, setNewAccount] = useState<CreateAccount>({
    name: "",
    accountCategoryId: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const categoriesResponse = await api.get("/categories/accounts");
      const [accountsResponse] = await Promise.all([
        api.get("/user/accounts/list"),
        categoriesResponse,
      ]);

      if (accountsResponse.success) {
        setAccounts(accountsResponse.data?.accounts || []);
      }

      if (categoriesResponse && categoriesResponse.success) {
        setCategories(
          Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/user/accounts/create", newAccount);
      if (response.success) {
        await fetchData();
        setShowCreateForm(false);
        setNewAccount({ name: "", accountCategoryId: 1 });
      }
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportAccountsToPDF(accounts);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getPositiveBalance = () => {
    return accounts.filter(a => a.balance > 0).reduce((total, account) => total + account.balance, 0);
  };

  const getNegativeBalance = () => {
    return accounts.filter(a => a.balance < 0).reduce((total, account) => total + Math.abs(account.balance), 0);
  };

  const getAccountTypeIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "checking":
        return <Wallet className="h-6 w-6" />;
      case "savings":
        return <PiggyBank className="h-6 w-6" />;
      case "credit":
        return <CreditCard className="h-6 w-6" />;
      case "investment":
        return <Building className="h-6 w-6" />;
      default:
        return <DollarSign className="h-6 w-6" />;
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-success-modern";
    if (balance < 0) return "text-error-modern";
    return "text-muted-modern";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-4 text-white">
            <div className="loading-spinner"></div>
            <span className="text-lg font-medium">Loading accounts</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Accounts</h1>
          <p className="text-muted-modern text-lg">
            Manage your financial accounts
          </p>
        </div>
        <div className="flex gap-3">
          {accounts.length > 0 && (
            <Button 
              onClick={handleExportPDF}
              className="btn-outline-modern flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          )}
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="btn-modern flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="dialog-modern sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Create Account</DialogTitle>
                <DialogDescription className="text-muted-modern">
                  Add a new account to track your finances
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAccount}>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-medium">
                      Account Name
                    </Label>
                    <Input
                      id="name"
                      value={newAccount.name}
                      onChange={(e) =>
                        setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="input-modern"
                      placeholder="Enter account name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white font-medium">
                      Account Type
                    </Label>
                    <Select
                      value={newAccount.accountCategoryId.toString()}
                      onValueChange={(value: string) =>
                        setNewAccount((prev) => ({
                          ...prev,
                          accountCategoryId: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="input-modern">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="dialog-modern">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="btn-modern w-full">
                    Create Account
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-modern text-sm font-medium uppercase tracking-wide">
                  Total Balance
                </p>
                <p className={`text-3xl font-bold mt-2 ${getBalanceColor(getTotalBalance())}`}>
                  ${getTotalBalance().toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-gray-800 to-black border border-gray-700">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-modern text-sm font-medium uppercase tracking-wide">
                  Total Assets
                </p>
                <p className="text-3xl font-bold mt-2 text-success-modern">
                  ${getPositiveBalance().toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-800 bg-opacity-60 border border-gray-700">
                <TrendingUp className="h-6 w-6 text-success-modern" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-modern text-sm font-medium uppercase tracking-wide">
                  Total Liabilities
                </p>
                <p className="text-3xl font-bold mt-2 text-error-modern">
                  ${getNegativeBalance().toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-800 bg-opacity-60 border border-gray-700">
                <TrendingDown className="h-6 w-6 text-error-modern" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="text-center py-20">
          <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center mx-auto mb-6 border border-gray-700">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No accounts yet</h3>
            <p className="text-muted-modern mb-8 text-lg">
              Create your first account to start tracking your finances
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="btn-modern"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div key={account.id} className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black bg-opacity-30 border border-gray-700">
                    {getAccountTypeIcon(account.accountCategoryName)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{account.name}</h3>
                    <p className="text-sm text-muted-modern capitalize">
                      {account.accountCategoryName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-modern font-medium uppercase tracking-wide mb-1">
                  Balance
                </p>
                <p className={`text-2xl font-bold ${getBalanceColor(account.balance)}`}>
                  ${account.balance.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}