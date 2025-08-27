import { useState, useEffect, useCallback } from "react";
import { Layout } from "../components/Layout";
import { api } from "../utils/api";
import { exportTransactionsToPDF } from "../utils/pdfExport";
import type { Transaction, Account, CreateTransaction, Category } from "../types";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui";
import { 
    Plus, 
    Download, 
    Filter, 
    ArrowUpCircle, 
    ArrowDownCircle,
    DollarSign,
    Edit,
    Trash2,
    Receipt,
    Loader2
} from "lucide-react";

export function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
    const [newTransaction, setNewTransaction] = useState<CreateTransaction>({
        amount: 0,
        transactionDateTime: new Date().toISOString().slice(0, 16),
        accountId: 0,
        transactionCategoryId: 1,
        transactionType: "D",
        description: "",
    });
    const [updateTransaction, setUpdateTransaction] = useState<CreateTransaction | null>(null);
    const [updateDialogOpenId, setUpdateDialogOpenId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [transactionsResponse, accountsResponse, categoriesResponse] = await Promise.all([
                api.get("/user/transactions/fetch"),
                api.get("/user/accounts/list"),
                api.get("/categories/transactions"),
            ]);

            if (transactionsResponse.success) {
                setTransactions(transactionsResponse.data?.transactions || []);
            }

            if (accountsResponse.success) {
                const accountsList = accountsResponse.data?.accounts || [];
                setAccounts(accountsList);
                if (accountsList.length > 0 && newTransaction.accountId === 0) {
                    setNewTransaction((prev) => ({ ...prev, accountId: accountsList[0].id }));
                }
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
    }, [newTransaction.accountId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.post("/user/transactions/create", newTransaction);
            if (response.success) {
                await fetchData();
                setShowCreateForm(false);
                setNewTransaction({
                    amount: 0,
                    transactionDateTime: new Date().toISOString().slice(0, 16),
                    accountId: accounts[0]?.id || 0,
                    transactionCategoryId: 1,
                    transactionType: "D",
                    description: "",
                });
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateTransaction) return;
        setIsSubmitting(true);
        try {
            const response = await api.put(`/user/transactions/update/`, updateTransaction);
            if (response.success) {
                await fetchData();
                closeUpdateDialog();
            }
        } catch (error) {
            console.error("Error updating transaction:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTransaction = async (id: number) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        try {
            const response = await api.delete('/user/transactions/delete/', id);
            if (response.success) {
                await fetchData();
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };

    const handleExportPDF = () => {
        const accountName = selectedAccount ? accounts.find(a => a.id === selectedAccount)?.name : undefined;
        exportTransactionsToPDF(filteredTransactions, accountName);
    };

    const openUpdateDialog = (transaction: Transaction) => {
        setUpdateTransaction({
            id: transaction.id,
            amount: transaction.amount,
            transactionDateTime: new Date(transaction.transactionDateTime).toISOString().slice(0, 16),
            accountId: transaction.accountId,
            transactionCategoryId: transaction.transactionCategoryId,
            transactionType: transaction.transactionType,
            description: transaction.description || "",
        });
        setUpdateDialogOpenId(transaction.id);
    };

    const closeUpdateDialog = () => {
        setUpdateDialogOpenId(null);
        setUpdateTransaction(null);
    };

    const filteredTransactions = selectedAccount ? transactions.filter((t) => t.accountId === selectedAccount) : transactions;
    
    const getTotalCredits = () => filteredTransactions.filter(t => t.transactionType === 'C').reduce((total, t) => total + t.amount, 0);
    const getTotalDebits = () => filteredTransactions.filter(t => t.transactionType === 'D').reduce((total, t) => total + t.amount, 0);
    const getNetAmount = () => getTotalCredits() - getTotalDebits();

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">Track your income and expenses.</p>
                </div>
                <div className="flex gap-2">
                    {filteredTransactions.length > 0 && (
                        <Button variant="outline" onClick={handleExportPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    )}
                    <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Transaction</DialogTitle>
                                <DialogDescription>Add a new transaction to your account.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateTransaction}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={newTransaction.amount || ""}
                                            onChange={(e) =>
                                                setNewTransaction((prev) => ({ 
                                                    ...prev, 
                                                    amount: parseFloat(e.target.value) || 0 
                                                }))
                                            }
                                            placeholder="0.00"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="transactionType">Transaction Type</Label>
                                        <Select
                                            value={newTransaction.transactionType}
                                            onValueChange={(value: string) =>
                                                setNewTransaction((prev) => ({
                                                    ...prev,
                                                    transactionType: value as 'C' | 'D',
                                                }))
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select transaction type">
                                                    {newTransaction.transactionType === 'C' ? 'Credit (Income)' : 
                                                     newTransaction.transactionType === 'D' ? 'Debit (Expense)' : 
                                                     'Select transaction type'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="C">Credit (Income)</SelectItem>
                                                <SelectItem value="D">Debit (Expense)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account">Account</Label>
                                        <Select
                                            value={newTransaction.accountId.toString()}
                                            onValueChange={(value: string) =>
                                                setNewTransaction((prev) => ({
                                                    ...prev,
                                                    accountId: parseInt(value),
                                                }))
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account">
                                                    {accounts.find(a => a.id === newTransaction.accountId)?.name || "Select account"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id.toString()}>
                                                        {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={newTransaction.transactionCategoryId.toString()}
                                            onValueChange={(value: string) =>
                                                setNewTransaction((prev) => ({
                                                    ...prev,
                                                    transactionCategoryId: parseInt(value),
                                                }))
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category">
                                                    {categories.find(c => c.id === newTransaction.transactionCategoryId)?.name || "Select category"}
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
                                    <div className="grid gap-2">
                                        <Label htmlFor="date">Date & Time</Label>
                                        <Input
                                            id="date"
                                            type="datetime-local"
                                            value={newTransaction.transactionDateTime}
                                            onChange={(e) =>
                                                setNewTransaction((prev) => ({ 
                                                    ...prev, 
                                                    transactionDateTime: e.target.value 
                                                }))
                                            }
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Input
                                            id="description"
                                            value={newTransaction.description || ""}
                                            onChange={(e) =>
                                                setNewTransaction((prev) => ({ 
                                                    ...prev, 
                                                    description: e.target.value 
                                                }))
                                            }
                                            placeholder="e.g., Grocery shopping, Salary, etc."
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Transaction
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {transactions.length > 0 ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                                <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">${getTotalCredits().toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-500">${getTotalDebits().toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getNetAmount() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ${getNetAmount().toFixed(2)}
                            </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                <div className="flex items-center gap-4">
                                <Filter className="h-5 w-5 text-muted-foreground" />
                                <Label>Filter by account:</Label>
                    <Select
                        value={selectedAccount?.toString() || "all"}
                        onValueChange={(value) => setSelectedAccount(value === "all" ? null : parseInt(value))}
                    >
                                    <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                                    <SelectContent>
                            <SelectItem value="all">All Accounts</SelectItem>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                        <TableHeader>
                            <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.description || transaction.transactionCategoryName}</TableCell>
                                            <TableCell>{transaction.transactionCategoryName}</TableCell>
                                            <TableCell>{transaction.accountName}</TableCell>
                                            <TableCell>{new Date(transaction.transactionDateTime).toLocaleDateString()}</TableCell>
                                            <TableCell className={`text-right font-bold ${transaction.transactionType === 'C' ? 'text-green-500' : 'text-red-500'}`}>
                                        {transaction.transactionType === "C" ? "+" : "-"}${transaction.amount.toFixed(2)}
                                    </TableCell>
                                            <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Dialog
                                                open={updateDialogOpenId === transaction.id}
                                                onOpenChange={(open) =>
                                                    open ? openUpdateDialog(transaction) : closeUpdateDialog()
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                        <DialogContent>
                                                    <DialogHeader>
                                                                <DialogTitle>Update Transaction</DialogTitle>
                                                    </DialogHeader>
                                                    {updateTransaction && (
                                                        <form onSubmit={handleUpdateTransaction}>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="update-amount">Amount</Label>
                                                                    <Input
                                                                        id="update-amount"
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        value={updateTransaction.amount || ""}
                                                                        onChange={(e) =>
                                                                            setUpdateTransaction((prev) => prev ? ({ 
                                                                                ...prev, 
                                                                                amount: parseFloat(e.target.value) || 0 
                                                                            }) : null)
                                                                        }
                                                                        placeholder="0.00"
                                                                        required
                                                                        disabled={isSubmitting}
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="update-transactionType">Transaction Type</Label>
                                                                    <Select
                                                                        value={updateTransaction.transactionType}
                                                                        onValueChange={(value: string) =>
                                                                            setUpdateTransaction((prev) => prev ? ({
                                                                                ...prev,
                                                                                transactionType: value as 'C' | 'D',
                                                                            }) : null)
                                                                        }
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select transaction type">
                                                                                {updateTransaction.transactionType === 'C' ? 'Credit (Income)' : 
                                                                                 updateTransaction.transactionType === 'D' ? 'Debit (Expense)' : 
                                                                                 'Select transaction type'}
                                                                            </SelectValue>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="C">Credit (Income)</SelectItem>
                                                                            <SelectItem value="D">Debit (Expense)</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="update-account">Account</Label>
                                                                    <Select
                                                                        value={updateTransaction.accountId.toString()}
                                                                        onValueChange={(value: string) =>
                                                                            setUpdateTransaction((prev) => prev ? ({
                                                                                ...prev,
                                                                                accountId: parseInt(value),
                                                                            }) : null)
                                                                        }
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select account">
                                                                                {accounts.find(a => a.id === updateTransaction.accountId)?.name || "Select account"}
                                                                            </SelectValue>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {accounts.map((account) => (
                                                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                                                    {account.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="update-category">Category</Label>
                                                                    <Select
                                                                        value={updateTransaction.transactionCategoryId.toString()}
                                                                        onValueChange={(value: string) =>
                                                                            setUpdateTransaction((prev) => prev ? ({
                                                                                ...prev,
                                                                                transactionCategoryId: parseInt(value),
                                                                            }) : null)
                                                                        }
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select category">
                                                                                {categories.find(c => c.id === updateTransaction.transactionCategoryId)?.name || "Select category"}
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
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="update-date">Date & Time</Label>
                                                                    <Input
                                                                        id="update-date"
                                                                        type="datetime-local"
                                                                        value={updateTransaction.transactionDateTime}
                                                                        onChange={(e) =>
                                                                            setUpdateTransaction((prev) => prev ? ({ 
                                                                                ...prev, 
                                                                                transactionDateTime: e.target.value 
                                                                            }) : null)
                                                                        }
                                                                        required
                                                                        disabled={isSubmitting}
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="update-description">Description (Optional)</Label>
                                                                    <Input
                                                                        id="update-description"
                                                                        value={updateTransaction.description || ""}
                                                                        onChange={(e) =>
                                                                            setUpdateTransaction((prev) => prev ? ({ 
                                                                                ...prev, 
                                                                                description: e.target.value 
                                                                            }) : null)
                                                                        }
                                                                        placeholder="e.g., Grocery shopping, Salary, etc."
                                                                        disabled={isSubmitting}
                                                                    />
                                                                </div>
                                                            </div>
                                                                    <DialogFooter>
                                                                        <Button type="button" variant="outline" onClick={closeUpdateDialog}>Cancel</Button>
                                                                        <Button type="submit" disabled={isSubmitting}>
                                                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                            Update
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(transaction.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <Receipt className="h-10 w-10 text-muted-foreground" />
                        <h3 className="text-2xl font-bold tracking-tight">
                            You have no transactions
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            You can start managing your finances as soon as you add a transaction.
                        </p>
                        <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Transaction
                        </Button>
                    </div>
                </div>
            )}
        </Layout>
    );
}