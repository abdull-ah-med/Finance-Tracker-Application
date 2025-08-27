using System;
using Backend.Models;
using Backend.DTO;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using FluentValidation.Validators;

namespace Backend.Services;

public class TransactionService : ITransactionService
{
    private readonly AppDbContext _context;

    public TransactionService(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<ServiceResult<ResponseTransactionDTO>> CreateTransactionAsync(CreateTransactionDTO createTransactionDTO, int userID)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == createTransactionDTO.AccountId && a.UserId == userID);
        if (account == null)
        {
            return new ServiceResult<ResponseTransactionDTO>
            {
                Success = false,
                Message = "Account not found",
                StatusCode = 404
            };
        }

        if (createTransactionDTO.TransactionType == 'C')
        {
            account.Balance += createTransactionDTO.Amount;
        }
        else if (createTransactionDTO.TransactionType == 'D') // Expense
        {
            if (createTransactionDTO.Amount > account.Balance)
            {
                return new ServiceResult<ResponseTransactionDTO>
                {
                    Success = false,
                    Message = "Insufficient balance for this debit transaction.",
                    StatusCode = 400
                };
            }
            account.Balance -= createTransactionDTO.Amount;
        }

        var newTransaction = new Transaction
        {
            Amount = createTransactionDTO.Amount,
            TransactionDateTime = createTransactionDTO.TransactionDateTime,
            Description = createTransactionDTO.Description ?? string.Empty,
            AccountId = account.Id,
            TransactionCategoryId = createTransactionDTO.TransactionCategoryId,
            TransactionType = createTransactionDTO.TransactionType
        };

        await _context.Transactions.AddAsync(newTransaction);
        await _context.SaveChangesAsync();

        var transactionWithIncludes = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.TransactionCategory)
            .FirstOrDefaultAsync(t => t.Id == newTransaction.Id);

        if (transactionWithIncludes == null)
        {
            return new ServiceResult<ResponseTransactionDTO>
            {
                Success = false,
                Message = "Failed to retrieve created transaction",
                StatusCode = 500
            };
        }

        return new ServiceResult<ResponseTransactionDTO>
        {
            Success = true,
            Message = "Transaction Successfully created",
            StatusCode = 201,
            Data = new ResponseTransactionDTO
            {
                Id = transactionWithIncludes.Id,
                Amount = transactionWithIncludes.Amount,
                TransactionDateTime = DateTime.SpecifyKind(createTransactionDTO.TransactionDateTime, DateTimeKind.Utc),
                Description = transactionWithIncludes.Description,
                AccountId = transactionWithIncludes.AccountId,
                AccountName = transactionWithIncludes.Account.Name,
                TransactionCategoryId = transactionWithIncludes.TransactionCategoryId,
                TransactionCategoryName = transactionWithIncludes.TransactionCategory.Name,
                TransactionType = transactionWithIncludes.TransactionType
            }
        };
    }

    public async Task<ServiceResult<TransactionResponseListDTO>> GetTransactions(int userID)
    {
        var accounts = await _context.Accounts.AnyAsync(a => a.UserId == userID);
        if (!accounts)
        {
            return new ServiceResult<TransactionResponseListDTO>
            {
                Success = false,
                Message = "User has no accounts.",
                StatusCode = 404
            };
        }

        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.TransactionCategory)
            .Where(t => t.Account.UserId == userID)
            .OrderByDescending(t => t.TransactionDateTime)
            .ToListAsync();

        if (transactions == null || !transactions.Any())
        {
            return new ServiceResult<TransactionResponseListDTO>
            {
                Success = true,
                Message = "There are no transactions against User.",
                StatusCode = 200
            };
        }

        var responseTransactions = transactions.Select(t => new ResponseTransactionDTO
        {
            Id = t.Id,
            Amount = t.Amount,
            TransactionDateTime = t.TransactionDateTime,
            Description = t.Description,
            AccountId = t.AccountId,
            AccountName = t.Account.Name,
            TransactionCategoryId = t.TransactionCategoryId,
            TransactionCategoryName = t.TransactionCategory.Name,
            TransactionType = t.TransactionType
        }).ToList();

        return new ServiceResult<TransactionResponseListDTO>
        {
            Success = true,
            StatusCode = 200,
            Data = new TransactionResponseListDTO
            {
                Transactions = responseTransactions,
                TotalCount = responseTransactions.Count
            }
        };
    }

    public async Task<ServiceResult<TransactionResponseListDTO>> GetTransactions(int userID, int accountID)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userID && a.Id == accountID);
        if (account == null)
        {
            return new ServiceResult<TransactionResponseListDTO>
            {
                Success = false,
                Message = "Account not found.",
                StatusCode = 404
            };
        }

        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.TransactionCategory)
            .Where(t => t.Account.UserId == userID && t.AccountId == accountID)
            .OrderByDescending(t => t.TransactionDateTime)
            .ToListAsync();

        if (transactions == null || !transactions.Any())
        {
            return new ServiceResult<TransactionResponseListDTO>
            {
                Success = false,
                Message = "There are no transactions against this account.",
                StatusCode = 404
            };
        }

        var responseTransactions = transactions.Select(t => new ResponseTransactionDTO
        {
            Id = t.Id,
            Amount = t.Amount,
            TransactionDateTime = t.TransactionDateTime,
            Description = t.Description,
            AccountId = t.AccountId,
            AccountName = t.Account.Name,
            TransactionCategoryId = t.TransactionCategoryId,
            TransactionCategoryName = t.TransactionCategory.Name,
            TransactionType = t.TransactionType
        }).ToList();

        return new ServiceResult<TransactionResponseListDTO>
        {
            Success = true,
            StatusCode = 200,
            Data = new TransactionResponseListDTO
            {
                Transactions = responseTransactions,
                TotalCount = responseTransactions.Count
            }
        };
    }

    public async Task<ServiceResult<TransactionResponseListDTO>> GetTransactions(int userID, int accountID, int TransactionCategoryId)
    {
        var accountExists = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userID && a.Id == accountID);
        if (accountExists == null)
        {
            return new ServiceResult<TransactionResponseListDTO>
            {
                Success = false,
                Message = "Account not found",
                StatusCode = 404
            };
        }

        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.TransactionCategory)
            .Where(t => t.Account.UserId == userID && t.AccountId == accountID && t.TransactionCategoryId == TransactionCategoryId)
            .OrderByDescending(t => t.TransactionDateTime)
            .ToListAsync();

        if (transactions == null || !transactions.Any())
        {
            return new ServiceResult<TransactionResponseListDTO>
            {
                Success = true,
                Message = "No transactions found against these filters",
                StatusCode = 200
            };
        }

        var responseTransactions = transactions.Select(t => new ResponseTransactionDTO
        {
            Id = t.Id,
            Amount = t.Amount,
            TransactionDateTime = t.TransactionDateTime,
            Description = t.Description,
            AccountId = t.AccountId,
            AccountName = t.Account.Name,
            TransactionCategoryId = t.TransactionCategoryId,
            TransactionCategoryName = t.TransactionCategory.Name,
            TransactionType = t.TransactionType
        }).ToList();

        return new ServiceResult<TransactionResponseListDTO>
        {
            Success = true,
            StatusCode = 200,
            Data = new TransactionResponseListDTO
            {
                Transactions = responseTransactions,
                TotalCount = responseTransactions.Count
            }
        };
    }
    public async Task<ServiceResult<ResponseTransactionDTO>> UpdateTransactionAsync(UpdateTransactionDTO updateTransactionDTO, int userId)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == updateTransactionDTO.Id);
        var user = await _context.Accounts.Include(a => a.User).FirstOrDefaultAsync(a => a.UserId == userId && updateTransactionDTO.AccountId == a.Id);
        if (transaction == null || user == null)
        {
            return new ServiceResult<ResponseTransactionDTO>
            {
                Success = false,
                Message = "User or Transaction Not Found",
                StatusCode = 404
            };
        }

        var oldTransactionAccount = await _context.Accounts.FindAsync(transaction.AccountId); // Old transaction Account
        var newTransactionAccount = await _context.Accounts.FindAsync(updateTransactionDTO.AccountId); // New transaction Account
        // if(oldTransactionAccount.UserId != user.Id || (newTransactionAccount != null && newTransactionAccount.UserId != user.Id))
        // {
        //     return new ServiceResult<ResponseTransactionDTO>
        //     {
        //         Success = false,
        //         Message = "Unauthorized to update this transaction",
        //         StatusCode = 403,
        //         // Data = oldTransactionAccount
        //     };
        // }
        // Revert the old transaction
        if (oldTransactionAccount != null)
        {
            if (transaction.TransactionType == 'C')
            {
                if (oldTransactionAccount.Balance >= transaction.Amount)
                {
                    oldTransactionAccount.Balance -= transaction.Amount;
                }
                else
                {
                    return new ServiceResult<ResponseTransactionDTO>
                    {
                        Success = false,
                        Message = "Insufficient balance for this credit transaction.",
                        StatusCode = 400
                    };
                }
            }
            else if (transaction.TransactionType == 'D')
            {
                oldTransactionAccount.Balance += transaction.Amount;
            }
            else
            {
                return new ServiceResult<ResponseTransactionDTO>
                {
                    Success = false,
                    Message = "Invalid transaction type in existing transaction",
                    StatusCode = 400
                };
            }
        }
        else
        {
            return new ServiceResult<ResponseTransactionDTO>
            {
                Success = false,
                Message = "Old transaction account not found",
                StatusCode = 404
            };
        }


        // Update the transaction
        if (newTransactionAccount == null)
        {
            return new ServiceResult<ResponseTransactionDTO>
            {
                Success = false,
                Message = "New transaction account not found",
                StatusCode = 404
            };
        }
        if (updateTransactionDTO.TransactionType != 'C' && updateTransactionDTO.TransactionType != 'D')
        {
            return new ServiceResult<ResponseTransactionDTO>
            {
                Success = false,
                Message = "Invalid transaction type in updated transaction",
                StatusCode = 400
            };
        }
        if (updateTransactionDTO.TransactionType == 'C')
        {
            newTransactionAccount.Balance += updateTransactionDTO.Amount;
        }
        else if (updateTransactionDTO.TransactionType == 'D')
        {

            if (newTransactionAccount.Balance >= updateTransactionDTO.Amount)
            {
                newTransactionAccount.Balance -= updateTransactionDTO.Amount;
            }
            else
            {
                return new ServiceResult<ResponseTransactionDTO>
                {
                    Success = false,
                    Message = "Insufficient balance for this debit transaction.",
                    StatusCode = 400
                };
            }
        }

        transaction.Amount = updateTransactionDTO.Amount;
        transaction.TransactionDateTime = updateTransactionDTO.TransactionDateTime;
        transaction.Description = updateTransactionDTO.Description ?? string.Empty;
        transaction.AccountId = updateTransactionDTO.AccountId;
        transaction.TransactionCategoryId = updateTransactionDTO.TransactionCategoryId;
        transaction.TransactionType = updateTransactionDTO.TransactionType;
        await _context.SaveChangesAsync();

        return new ServiceResult<ResponseTransactionDTO>
        {
            Success = true,
            Message = "Transaction updated successfully.",
            StatusCode = 200,
            Data = new ResponseTransactionDTO
            {
                Id = transaction.Id,
                Amount = transaction.Amount,
                TransactionDateTime = transaction.TransactionDateTime,
                Description = transaction.Description,
                AccountId = transaction.AccountId,
                TransactionCategoryId = transaction.TransactionCategoryId,
                TransactionType = transaction.TransactionType
            }
        };
    }


    public async Task<ServiceResult<string>> DeleteTransactionAsync(int transactionID, int userId)
    {
        var transaction = await _context.Transactions.FindAsync(transactionID);
        var user = await _context.Accounts.Include(a => a.User).FirstOrDefaultAsync(a => a.UserId == userId && transaction != null && transaction.AccountId == a.Id);
        if (transaction == null || user == null)
        {
            return new ServiceResult<string>
            {
                Success = false,
                Message = "User or Transaction Not Found",
                StatusCode = 404
            };
        }
        var transactionAccount = await _context.Accounts.FindAsync(transaction.AccountId);
        if (transactionAccount == null)
        {
            return new ServiceResult<string>
            {
                Success = false,
                Message = "Transaction account not found",
                StatusCode = 404
            };
        }
        // Revert Transaction Changes
        if (transaction.TransactionType == 'C')
        {
            if (transactionAccount.Balance >= transaction.Amount)
            {
                transactionAccount.Balance -= transaction.Amount;
            }
            else
            {
                return new ServiceResult<string>
                {
                    Success = false,
                    Message = "Insufficient balance to delete this credit transaction.",
                    StatusCode = 400
                };
            }
        }
        else if (transaction.TransactionType == 'D')
        {
            transactionAccount.Balance += transaction.Amount;
        }
        else
        {
            return new ServiceResult<string>
            {
                Success = false,
                Message = "Invalid transaction type in existing transaction",
                StatusCode = 400
            };
        }

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return new ServiceResult<string>
        {
            Success = true,
            Message = "Transaction deleted successfully.",
            StatusCode = 200,
            Data = transactionID.ToString()
        };
    }
}

