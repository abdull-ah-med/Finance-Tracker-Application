import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { api } from "@/utils/api";
import type { Account, Category, CreateAccount } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        await fetchData(); // Refresh the list
        setShowCreateForm(false);
        setNewAccount({ name: "", accountCategoryId: 1 });
      }
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getAccountTypeIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "checking":
        return "🏦";
      case "savings":
        return "💰";
      case "credit":
        return "💳";
      case "investment":
        return "📈";
      default:
        return "💼";
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-500";
    if (balance < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Loading your accounts...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Accounts</h1>
          <p className="text-muted-foreground">
            Manage and track your financial accounts
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>Add Account</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>
                Add a new account to track your finances.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAccount}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
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
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an account type" />
                    </SelectTrigger>
                    <SelectContent>
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
                <Button type="submit">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalanceColor(getTotalBalance())}`}>
              ${getTotalBalance().toFixed(2)}
            </div>
          </CardContent>
        </Card>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first account to start tracking your finances
          </p>
          <Button onClick={() => setShowCreateForm(true)}>Create Account</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {account.name}
                </CardTitle>
                <span className="text-2xl">
                  {getAccountTypeIcon(account.accountCategoryName)}
                </span>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getBalanceColor(account.balance)}`}>
                  ${account.balance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  {account.accountCategoryName}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}