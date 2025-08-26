import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { api } from "@/utils/api";
import { exportTransactionsToPDF } from "@/utils/pdfExport";
import type { Transaction, Account, Category, CreateTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Plus, 
    Download, 
    Filter, 
    ArrowUpCircle, 
    ArrowDownCircle,
    DollarSign,
    Edit,
    Trash2,
    Receipt
} from "lucide-react";

export function Transactions() {
    const [updateDialogOpenId, setUpdateDialogOpenId] = useState<number | null>(null);
    const [updateTransaction, setUpdateTransaction] = useState<CreateTransaction | null>(null);
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
        transactionType: "D",
        description: "",
    });

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

    const handleUpdateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateTransaction) return;

        try {
            const response = await api.put(`/user/transactions/update/${updateTransaction.id}`, updateTransaction);
            if (response.success) {
                await fetchData();
                closeUpdateDialog();
            }
        } catch (error) {
            console.error("Error updating transaction:", error);
        }
    };

    const handleDeleteTransaction = async (id: number) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        try {
            const response = await api.delete(`/user/transactions/delete/${id}`);
            if (response.success) {
                await fetchData();
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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

            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
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
        }
    };

    const handleExportPDF = async () => {
        try {
            const accountName = selectedAccount 
                ? accounts.find(a => a.id === selectedAccount)?.name
                : undefined;
            await exportTransactionsToPDF(filteredTransactions, accountName);
        } catch (error) {
            console.error("Error exporting PDF:", error);
        }
    };

    const filterTransactionsByAccount = (accountId: number | null) => {
        if (accountId === null) return transactions;
        return transactions.filter((t) => t.accountId === accountId);
    };

    const getAmountColor = (type: string) => {
        return type === "C" ? "text-success-modern" : "text-error-modern";
    };

    const getTotalCredits = () => {
        return filteredTransactions
            .filter(t => t.transactionType === 'C')
            .reduce((total, t) => total + t.amount, 0);
    };

    const getTotalDebits = () => {
        return filteredTransactions
            .filter(t => t.transactionType === 'D')
            .reduce((total, t) => total + t.amount, 0);
    };

    const getNetAmount = () => {
        return getTotalCredits() - getTotalDebits();
    };

    const filteredTransactions = filterTransactionsByAccount(selectedAccount);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-20">
                    <div className="flex items-center space-x-4 text-white">
                        <div className="loading-spinner"></div>
                        <span className="text-lg font-medium">Loading transactions</span>
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
                    <h1 className="text-4xl font-bold text-white mb-2">Transactions</h1>
                    <p className="text-muted-modern text-lg">
                        Track your income and expenses
                    </p>
                </div>
                <div className="flex gap-3">
                    {filteredTransactions.length > 0 && (
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
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="dialog-modern sm:max-w-[500px] rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-white">Create Transaction</DialogTitle>
                                <DialogDescription className="text-muted-modern">
                                    Add a new transaction to track your finances
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateTransaction}>
                                <div className="grid gap-6 py-6">
                                    <div className="space-y-3">
                                        <Label className="text-white font-medium">Transaction Type</Label>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant={newTransaction.transactionType === "C" ? "default" : "outline"}
                                                className={newTransaction.transactionType === "C" ? "btn-modern flex-1" : "btn-outline-modern flex-1"}
                                                onClick={() =>
                                                    setNewTransaction((prev) => ({ ...prev, transactionType: "C" }))
                                                }
                                            >
                                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                                                Income
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={newTransaction.transactionType === "D" ? "default" : "outline"}
                                                className={newTransaction.transactionType === "D" ? "btn-modern flex-1" : "btn-outline-modern flex-1"}
                                                onClick={() =>
                                                    setNewTransaction((prev) => ({ ...prev, transactionType: "D" }))
                                                }
                                            >
                                                <ArrowDownCircle className="h-4 w-4 mr-2" />
                                                Expense
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-white font-medium">
                                            Amount
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={newTransaction.amount}
                                            onChange={(e) =>
                                                setNewTransaction((prev) => ({
                                                    ...prev,
                                                    amount: parseFloat(e.target.value) || 0,
                                                }))
                                            }
                                            className="input-modern"
                                            placeholder="Enter amount"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="account" className="text-white font-medium">
                                            Account
                                        </Label>
                                        <Select
                                            value={newTransaction.accountId.toString()}
                                            onValueChange={(value) =>
                                                setNewTransaction((prev) => ({ ...prev, accountId: parseInt(value) }))
                                            }
                                        >
                                            <SelectTrigger className="input-modern">
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent className="dialog-modern">
                                                {accounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id.toString()}>
                                                        {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-white font-medium">
                                            Category
                                        </Label>
                                        <Select
                                            value={newTransaction.transactionCategoryId.toString()}
                                            onValueChange={(value) =>
                                                setNewTransaction((prev) => ({
                                                    ...prev,
                                                    transactionCategoryId: parseInt(value),
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="input-modern">
                                                <SelectValue placeholder="Select category" />
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

                                    <div className="space-y-2">
                                        <Label htmlFor="datetime" className="text-white font-medium">
                                            Date & Time
                                        </Label>
                                        <Input
                                            id="datetime"
                                            type="datetime-local"
                                            value={newTransaction.transactionDateTime}
                                            onChange={(e) =>
                                                setNewTransaction((prev) => ({
                                                    ...prev,
                                                    transactionDateTime: e.target.value,
                                                }))
                                            }
                                            className="input-modern"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-white font-medium">
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            value={newTransaction.description}
                                            onChange={(e) =>
                                                setNewTransaction((prev) => ({ ...prev, description: e.target.value }))
                                            }
                                            className="input-modern"
                                            placeholder="Optional description"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="btn-modern w-full">
                                        Create Transaction
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Summary Cards */}
            {filteredTransactions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-modern text-sm font-medium uppercase tracking-wide">
                                    Total Income
                                </p>
                                <p className="text-3xl font-bold mt-2 text-success-modern">
                                    ${getTotalCredits().toFixed(2)}
                                </p>
                            </div>
                                          <div className="p-3 rounded-xl bg-gray-800 bg-opacity-60 border border-gray-700">
                <ArrowUpCircle className="h-6 w-6 text-success-modern" />
              </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-modern text-sm font-medium uppercase tracking-wide">
                                    Total Expenses
                                </p>
                                <p className="text-3xl font-bold mt-2 text-error-modern">
                                    ${getTotalDebits().toFixed(2)}
                                </p>
                            </div>
                                          <div className="p-3 rounded-xl bg-gray-800 bg-opacity-60 border border-gray-700">
                <ArrowDownCircle className="h-6 w-6 text-error-modern" />
              </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-modern text-sm font-medium uppercase tracking-wide">
                                    Net Amount
                                </p>
                                <p className={`text-3xl font-bold mt-2 ${getNetAmount() >= 0 ? 'text-success-modern' : 'text-error-modern'}`}>
                                    {getNetAmount() >= 0 ? '+' : ''}${getNetAmount().toFixed(2)}
                                </p>
                            </div>
                                          <div className="p-3 rounded-xl bg-gradient-to-r from-gray-800 to-black border border-gray-700">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-4">
                    <Filter className="h-5 w-5 text-muted-modern" />
                    <Label className="text-white font-medium">Filter by account:</Label>
                    <Select
                        value={selectedAccount?.toString() || "all"}
                        onValueChange={(value) => setSelectedAccount(value === "all" ? null : parseInt(value))}
                    >
                        <SelectTrigger className="input-modern w-64">
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent className="dialog-modern">
                            <SelectItem value="all">All Accounts</SelectItem>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-20">
                    <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center mx-auto mb-6 border border-gray-700">
              <Receipt className="h-10 w-10 text-white" />
            </div>
                        <h3 className="text-2xl font-bold text-white mb-3">No transactions yet</h3>
                        <p className="text-muted-modern mb-8 text-lg">
                            {selectedAccount
                                ? "No transactions for this account"
                                : "Start tracking your income and expenses"}
                        </p>
                        <Button 
                            onClick={() => setShowCreateForm(true)}
                            className="btn-modern"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Transaction
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden">
                    <Table className="table-modern">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-white font-semibold">Description</TableHead>
                                <TableHead className="text-white font-semibold">Category</TableHead>
                                <TableHead className="text-white font-semibold">Account</TableHead>
                                <TableHead className="text-white font-semibold">Date & Time</TableHead>
                                <TableHead className="text-right text-white font-semibold">Amount</TableHead>
                                <TableHead className="text-center text-white font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((transaction) => (
                                <TableRow key={transaction.id} className="hover:bg-white hover:bg-opacity-5 transition-colors">
                                    <TableCell className="font-medium text-white">
                                        {transaction.description || transaction.transactionCategoryName}
                                    </TableCell>
                                    <TableCell className="text-muted-modern">
                                        {transaction.transactionCategoryName}
                                    </TableCell>
                                    <TableCell className="text-muted-modern">
                                        {transaction.accountName}
                                    </TableCell>
                                    <TableCell className="text-muted-modern">
                                        {new Date(transaction.transactionDateTime).toLocaleString()}
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${getAmountColor(transaction.transactionType)}`}>
                                        {transaction.transactionType === "C" ? "+" : "-"}${transaction.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <Dialog
                                                open={updateDialogOpenId === transaction.id}
                                                onOpenChange={(open) =>
                                                    open ? openUpdateDialog(transaction) : closeUpdateDialog()
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        size="sm" 
                                                        className="btn-outline-modern p-2"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="dialog-modern sm:max-w-[500px] rounded-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-bold text-white">
                                                            Update Transaction
                                                        </DialogTitle>
                                                        <DialogDescription className="text-muted-modern">
                                                            Edit the transaction details below
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    {updateTransaction && (
                                                        <form onSubmit={handleUpdateTransaction}>
                                                            <div className="grid gap-6 py-6">
                                                                <div className="space-y-3">
                                                                    <Label className="text-white font-medium">Transaction Type</Label>
                                                                    <div className="flex gap-3">
                                                                        <Button
                                                                            type="button"
                                                                            variant={updateTransaction.transactionType === "C" ? "default" : "outline"}
                                                                            className={updateTransaction.transactionType === "C" ? "btn-modern flex-1" : "btn-outline-modern flex-1"}
                                                                            onClick={() =>
                                                                                setUpdateTransaction((prev) =>
                                                                                    prev ? { ...prev, transactionType: "C" } : null
                                                                                )
                                                                            }
                                                                        >
                                                                            <ArrowUpCircle className="h-4 w-4 mr-2" />
                                                                            Income
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant={updateTransaction.transactionType === "D" ? "default" : "outline"}
                                                                            className={updateTransaction.transactionType === "D" ? "btn-modern flex-1" : "btn-outline-modern flex-1"}
                                                                            onClick={() =>
                                                                                setUpdateTransaction((prev) =>
                                                                                    prev ? { ...prev, transactionType: "D" } : null
                                                                                )
                                                                            }
                                                                        >
                                                                            <ArrowDownCircle className="h-4 w-4 mr-2" />
                                                                            Expense
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label className="text-white font-medium">Amount</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        value={updateTransaction.amount}
                                                                        onChange={(e) =>
                                                                            setUpdateTransaction((prev) =>
                                                                                prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null
                                                                            )
                                                                        }
                                                                        className="input-modern"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label className="text-white font-medium">Account</Label>
                                                                    <Select
                                                                        value={updateTransaction.accountId.toString()}
                                                                        onValueChange={(val) =>
                                                                            setUpdateTransaction((prev) =>
                                                                                prev ? { ...prev, accountId: parseInt(val) } : null
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="input-modern">
                                                                            <SelectValue placeholder="Select account" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="dialog-modern">
                                                                            {accounts.map((account) => (
                                                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                                                    {account.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label className="text-white font-medium">Category</Label>
                                                                    <Select
                                                                        value={updateTransaction.transactionCategoryId.toString()}
                                                                        onValueChange={(val) =>
                                                                            setUpdateTransaction((prev) =>
                                                                                prev ? { ...prev, transactionCategoryId: parseInt(val) } : null
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="input-modern">
                                                                            <SelectValue placeholder="Select category" />
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

                                                                <div className="space-y-2">
                                                                    <Label className="text-white font-medium">Date & Time</Label>
                                                                    <Input
                                                                        type="datetime-local"
                                                                        value={updateTransaction.transactionDateTime}
                                                                        onChange={(e) =>
                                                                            setUpdateTransaction((prev) =>
                                                                                prev ? { ...prev, transactionDateTime: e.target.value } : null
                                                                            )
                                                                        }
                                                                        className="input-modern"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label className="text-white font-medium">Description</Label>
                                                                    <Input
                                                                        value={updateTransaction.description}
                                                                        onChange={(e) =>
                                                                            setUpdateTransaction((prev) =>
                                                                                prev ? { ...prev, description: e.target.value } : null
                                                                            )
                                                                        }
                                                                        className="input-modern"
                                                                        placeholder="Optional description"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter className="gap-3">
                                                                <Button
                                                                    type="button"
                                                                    onClick={closeUpdateDialog}
                                                                    className="btn-outline-modern"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button type="submit" className="btn-modern">
                                                                    Update Transaction
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    )}
                                                </DialogContent>
                                            </Dialog>

                                            <Button 
                                                size="sm" 
                                                onClick={() => handleDeleteTransaction(transaction.id)}
                                                className="btn-outline-modern p-2 hover:bg-red-500 hover:bg-opacity-20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Layout>
    );
}