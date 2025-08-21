using System;
using Backend.Models;
using Backend.DTO;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

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
        account.Balance = account.Balance + createTransactionDTO.Amount;
        var newTransaction = new Transaction
        {
            Amount = createTransactionDTO.Amount,
            TransactionDateTime = createTransactionDTO.TransactionDateTime,
            Description = createTransactionDTO.Description ?? string.Empty,
            AccountId = account.Id,
            TransactionCategoryId = createTransactionDTO.TransactionCategoryId
        };

        await _context.Transactions.AddAsync(newTransaction);
        await _context.SaveChangesAsync();
        
        // Load navigation properties with a single query
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
                TransactionDateTime = transactionWithIncludes.TransactionDateTime,
                Description = transactionWithIncludes.Description,
                AccountId = transactionWithIncludes.AccountId,
                AccountName = transactionWithIncludes.Account.Name,
                TransactionCategoryId = transactionWithIncludes.TransactionCategoryId,
                TransactionCategoryName = transactionWithIncludes.TransactionCategory.Name
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
            .ToListAsync();
        if (transactions == null|| !transactions.Any())
        {
            return new ServiceResult<TransactionResponseListDTO>
            {
                Success = false,
                Message = "There are no transactions against User.",
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
            TransactionCategoryName = t.TransactionCategory.Name
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
        var accounts = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userID && a.Id == accountID);
        if (accounts == null)
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
            .ToListAsync();
        if (transactions == null|| !transactions.Any())
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
            TransactionCategoryName = t.TransactionCategory.Name
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
            .ToListAsync();
        if (transactions == null || !transactions.Any())
        {
            return new ServiceResult<TransactionResponseListDTO>
            {
                Success = false,
                Message = "No transactions found against these filters",
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
            TransactionCategoryName = t.TransactionCategory.Name
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
}
