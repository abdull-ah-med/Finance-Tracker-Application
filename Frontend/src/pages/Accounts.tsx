import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { api } from "../utils/api";
import type { Account, Category, CreateAccount } from "../types";

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
            const [accountsResponse] = await Promise.all([api.get("/user/accounts/list"), categoriesResponse]);

            if (accountsResponse.success) {
                setAccounts(accountsResponse.data?.accounts || []);
            }

            if (categoriesResponse && categoriesResponse.success) {
                setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
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
        if (balance > 0) return "text-green-400";
        if (balance < 0) return "text-red-400";
        return "text-slate-300";
    };

    if (isLoading) {
        return (
            <Layout>
                <div className='flex items-center justify-center py-12'>
                    <div className='flex items-center space-x-3 text-slate-400'>
                        <div className='w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-lg'>Loading your accounts...</span>
                    </div>
                </div>
            </Layout>
        );
    }
    return (
        <Layout>
            <div className='space-y-8'>
                {/* Header Section */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold text-white mb-2'>Your Accounts</h1>
                        <p className='text-slate-400'>Manage and track your financial accounts</p>
                    </div>
                    <button onClick={() => setShowCreateForm(true)} className='btn-primary'>
                        <span className='text-lg mr-2'>+</span>
                        Add Account
                    </button>
                </div>

                {/* Create Account Modal */}
                {showCreateForm && (
                    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                        <div className='bg-slate-800 p-6 rounded-xl w-full max-w-md'>
                            <h3 className='text-xl font-bold text-white mb-4'>Create New Account</h3>
                            <form onSubmit={handleCreateAccount}>
                                <div className='space-y-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-slate-300 mb-2'>
                                            Account Name
                                        </label>
                                        <input
                                            type='text'
                                            value={newAccount.name}
                                            onChange={(e) =>
                                                setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                            className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-slate-300 mb-2'>
                                            Account Type
                                        </label>
                                        <select
                                            value={newAccount.accountCategoryId}
                                            onChange={(e) =>
                                                setNewAccount((prev) => ({
                                                    ...prev,
                                                    accountCategoryId: parseInt(e.target.value),
                                                }))
                                            }
                                            className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className='flex gap-3 mt-6'>
                                    <button
                                        type='button'
                                        onClick={() => setShowCreateForm(false)}
                                        className='flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500'>
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500'>
                                        Create Account
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Summary Card */}
                {accounts.length > 0 && (
                    <div className='card'>
                        <div className='card-body'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <h3 className='text-lg font-medium text-slate-300 mb-1'>Total Balance</h3>
                                    <p className={`text-3xl font-bold ${getBalanceColor(getTotalBalance())}`}>
                                        ${getTotalBalance().toFixed(2)}
                                    </p>
                                </div>
                                <div className='text-4xl'>📊</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accounts Grid */}
                {accounts.length === 0 ? (
                    <div className='text-center py-12'>
                        <div className='text-6xl mb-4'>🏦</div>
                        <h3 className='text-xl font-semibold text-white mb-2'>No accounts yet</h3>
                        <p className='text-slate-400 mb-6'>Create your first account to start tracking your finances</p>
                        <button onClick={() => setShowCreateForm(true)} className='btn-primary'>
                            <span className='mr-2'>+</span>
                            Create Account
                        </button>
                    </div>
                ) : (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {accounts.map((account) => (
                            <div key={account.id} className='card hover:shadow-lg transition-shadow duration-200'>
                                <div className='card-body'>
                                    <div className='flex items-start justify-between mb-4'>
                                        <div className='flex items-center space-x-3'>
                                            <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl'>
                                                {getAccountTypeIcon(account.accountCategoryName)}
                                            </div>
                                            <div>
                                                <h3 className='font-semibold text-white'>{account.name}</h3>
                                                <p className='text-sm text-slate-400 capitalize'>
                                                    {account.accountCategoryName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='mt-4'>
                                        <p className='text-sm text-slate-400 mb-1'>Balance</p>
                                        <p className={`text-2xl font-bold ${getBalanceColor(account.balance)}`}>
                                            ${account.balance.toFixed(2)}
                                        </p>
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
