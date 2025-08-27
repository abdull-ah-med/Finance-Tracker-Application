import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { api } from "../utils/api";
import { exportAccountsToPDF } from "../utils/pdfExport";
import type { Account, Category, CreateAccount } from "../types";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui";
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, PiggyBank, Building, Loader2 } from "lucide-react";

export function Accounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newAccount, setNewAccount] = useState<CreateAccount>({
        name: "",
        accountCategoryId: 1,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [accountsResponse, categoriesResponse] = await Promise.all([
                api.get("/user/accounts/list"),
                api.get("/categories/accounts"),
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
        setIsSubmitting(true);
        try {
            const response = await api.post("/user/accounts/create", newAccount);
            if (response.success) {
                await fetchData();
                setShowCreateForm(false);
                setNewAccount({ name: "", accountCategoryId: 1 });
            }
        } catch (error) {
            console.error("Error creating account:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportPDF = () => {
        exportAccountsToPDF(accounts);
    };

    const getTotalBalance = () => accounts.reduce((total, account) => total + account.balance, 0);
    const getPositiveBalance = () => accounts.filter(a => a.balance > 0).reduce((total, account) => total + account.balance, 0);
    const getNegativeBalance = () => accounts.filter(a => a.balance < 0).reduce((total, account) => total + account.balance, 0);

    const getAccountTypeIcon = (categoryName: string) => {
        const iconProps = { size: 16, style: { color: 'var(--color-text-muted)' } };
        switch (categoryName.toLowerCase()) {
            case "checking": return <Wallet {...iconProps} />;
            case "savings": return <PiggyBank {...iconProps} />;
            case "credit": return <CreditCard {...iconProps} />;
            case "investment": return <Building {...iconProps} />;
            default: return <DollarSign {...iconProps} />;
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 size={32} className="spinner" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Accounts</h1>
                    <p className="text-muted">Manage your financial accounts.</p>
                </div>
                <div className="flex gap-2">
                    {accounts.length > 0 && (
                        <Button variant="outline" onClick={handleExportPDF}>
                            <Download size={16} style={{ marginRight: '8px' }} />
                            Export PDF
                        </Button>
                    )}
                    <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus size={16} style={{ marginRight: '8px' }} />
                                Add Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Account</DialogTitle>
                                <DialogDescription>
                                    Add a new account to track your finances.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateAccount}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Account Name</Label>
                                        <Input
                                            id="name"
                                            value={newAccount.name}
                                            onChange={(e) =>
                                                setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                            placeholder="e.g., Savings Account"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Account Type</Label>
                                        <Select
                                            value={newAccount.accountCategoryId.toString()}
                                            onValueChange={(value: string) =>
                                                setNewAccount((prev) => ({
                                                    ...prev,
                                                    accountCategoryId: parseInt(value),
                                                }))
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account type">
                                                    {categories.find(c => c.id === newAccount.accountCategoryId)?.name || "Select account type"}
                                                </SelectValue>
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
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 size={16} className="spinner" />}
                                        Create Account
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {accounts.length > 0 ? (
                <>
                    <div className="accounts-stats-grid mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                                <DollarSign size={16} style={{ color: 'var(--color-text-muted)' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${getTotalBalance().toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                                <TrendingUp size={16} style={{ color: 'var(--color-text-muted)' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-success">${getPositiveBalance().toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                                <TrendingDown size={16} style={{ color: 'var(--color-text-muted)' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-error">${getNegativeBalance().toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="accounts-grid">
                        {accounts.map((account) => (
                            <Card key={account.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
                                    {getAccountTypeIcon(account.accountCategoryName)}
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${account.balance < 0 ? 'text-error' : ''}`}>
                                        ${account.balance.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-muted capitalize">
                                        {account.accountCategoryName}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-content">
                        <h3 className="text-2xl font-bold">
                            You have no accounts
                        </h3>
                        <p className="text-sm text-muted">
                            You can start managing your finances as soon as you add an account.
                        </p>
                        <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                            <Plus size={16} style={{ marginRight: '8px' }} />
                            Add Account
                        </Button>
                    </div>
                </div>
            )}
        </Layout>
    );
}