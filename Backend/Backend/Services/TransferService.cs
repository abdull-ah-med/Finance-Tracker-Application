using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class TransferService : ITransferService
{
    private readonly AppDbContext _context;

    public TransferService(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<ServiceResult<TransferResponseDTO>> CreateTransferAsync(CreateTransferDTO createTransferDTO, int userId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Validate user owns both accounts
            var fromAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == createTransferDTO.FromAccountId && a.UserId == userId);
            
            var toAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == createTransferDTO.ToAccountId && a.UserId == userId);

            if (fromAccount == null)
            {
                return new ServiceResult<TransferResponseDTO>
                {
                    Success = false,
                    Message = "Source account not found or you don't have permission to access it",
                    StatusCode = 404
                };
            }

            if (toAccount == null)
            {
                return new ServiceResult<TransferResponseDTO>
                {
                    Success = false,
                    Message = "Destination account not found or you don't have permission to access it",
                    StatusCode = 404
                };
            }

            // Validate accounts are different
            if (createTransferDTO.FromAccountId == createTransferDTO.ToAccountId)
            {
                return new ServiceResult<TransferResponseDTO>
                {
                    Success = false,
                    Message = "Source and destination accounts cannot be the same",
                    StatusCode = 400
                };
            }

            // Check sufficient balance
            if (fromAccount.Balance < createTransferDTO.Amount)
            {
                return new ServiceResult<TransferResponseDTO>
                {
                    Success = false,
                    Message = "Insufficient balance in source account",
                    StatusCode = 400
                };
            }

            // Generate unique reference number
            var referenceNumber = $"TXF-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

            // Update account balances
            fromAccount.Balance -= createTransferDTO.Amount;
            toAccount.Balance += createTransferDTO.Amount;

            // Create debit transaction for source account
            var debitTransaction = new Transaction
            {
                Amount = createTransferDTO.Amount,
                TransactionDateTime = createTransferDTO.TransferDateTime,
                AccountId = fromAccount.Id,
                TransactionType = 'D',
                Description = $"Transfer to {toAccount.Name} - {createTransferDTO.Description}".Trim(),
                TransactionCategoryId = 10 // "Other" category for transfers
            };

            // Create credit transaction for destination account  
            var creditTransaction = new Transaction
            {
                Amount = createTransferDTO.Amount,
                TransactionDateTime = createTransferDTO.TransferDateTime,
                AccountId = toAccount.Id,
                TransactionType = 'C',
                Description = $"Transfer from {fromAccount.Name} - {createTransferDTO.Description}".Trim(),
                TransactionCategoryId = 10 // "Other" category for transfers
            };

            await _context.Transactions.AddAsync(debitTransaction);
            await _context.Transactions.AddAsync(creditTransaction);
            await _context.SaveChangesAsync();

            // Create transfer record
            var transfer = new Transfer
            {
                Amount = createTransferDTO.Amount,
                TransferDateTime = createTransferDTO.TransferDateTime,
                FromAccountId = createTransferDTO.FromAccountId,
                ToAccountId = createTransferDTO.ToAccountId,
                UserId = userId,
                Description = createTransferDTO.Description,
                ReferenceNumber = referenceNumber,
                DebitTransactionId = debitTransaction.Id,
                CreditTransactionId = creditTransaction.Id
            };

            await _context.Transfers.AddAsync(transfer);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            // Load related data for response
            var transferWithIncludes = await _context.Transfers
                .Include(t => t.FromAccount)
                .Include(t => t.ToAccount)
                .FirstOrDefaultAsync(t => t.Id == transfer.Id);

            return new ServiceResult<TransferResponseDTO>
            {
                Success = true,
                Message = "Transfer completed successfully",
                StatusCode = 201,
                Data = new TransferResponseDTO
                {
                    Id = transferWithIncludes!.Id,
                    Amount = transferWithIncludes.Amount,
                    TransferDateTime = transferWithIncludes.TransferDateTime,
                    FromAccountId = transferWithIncludes.FromAccountId,
                    FromAccountName = transferWithIncludes.FromAccount.Name,
                    ToAccountId = transferWithIncludes.ToAccountId,
                    ToAccountName = transferWithIncludes.ToAccount.Name,
                    Description = transferWithIncludes.Description,
                    ReferenceNumber = transferWithIncludes.ReferenceNumber,
                    DebitTransactionId = transferWithIncludes.DebitTransactionId,
                    CreditTransactionId = transferWithIncludes.CreditTransactionId
                }
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new ServiceResult<TransferResponseDTO>
            {
                Success = false,
                Message = $"An error occurred while processing the transfer: {ex.Message}",
                StatusCode = 500
            };
        }
    }

    public async Task<ServiceResult<TransferResponseListDTO>> GetTransfersAsync(int userId)
    {
        try
        {
            var transfers = await _context.Transfers
                .Include(t => t.FromAccount)
                .Include(t => t.ToAccount)
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.TransferDateTime)
                .ToListAsync();

            if (transfers == null || !transfers.Any())
            {
                return new ServiceResult<TransferResponseListDTO>
                {
                    Success = true,
                    Message = "No transfers found",
                    StatusCode = 200,
                    Data = new TransferResponseListDTO
                    {
                        Transfers = new List<TransferResponseDTO>(),
                        TotalCount = 0
                    }
                };
            }

            var transferResponses = transfers.Select(t => new TransferResponseDTO
            {
                Id = t.Id,
                Amount = t.Amount,
                TransferDateTime = t.TransferDateTime,
                FromAccountId = t.FromAccountId,
                FromAccountName = t.FromAccount.Name,
                ToAccountId = t.ToAccountId,
                ToAccountName = t.ToAccount.Name,
                Description = t.Description,
                ReferenceNumber = t.ReferenceNumber,
                DebitTransactionId = t.DebitTransactionId,
                CreditTransactionId = t.CreditTransactionId
            }).ToList();

            return new ServiceResult<TransferResponseListDTO>
            {
                Success = true,
                Message = "Transfers retrieved successfully",
                StatusCode = 200,
                Data = new TransferResponseListDTO
                {
                    Transfers = transferResponses,
                    TotalCount = transferResponses.Count
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<TransferResponseListDTO>
            {
                Success = false,
                Message = $"An error occurred while retrieving transfers: {ex.Message}",
                StatusCode = 500
            };
        }
    }

    public async Task<ServiceResult<TransferResponseDTO>> GetTransferAsync(int transferId, int userId)
    {
        try
        {
            var transfer = await _context.Transfers
                .Include(t => t.FromAccount)
                .Include(t => t.ToAccount)
                .FirstOrDefaultAsync(t => t.Id == transferId && t.UserId == userId);

            if (transfer == null)
            {
                return new ServiceResult<TransferResponseDTO>
                {
                    Success = false,
                    Message = "Transfer not found or you don't have permission to access it",
                    StatusCode = 404
                };
            }

            return new ServiceResult<TransferResponseDTO>
            {
                Success = true,
                Message = "Transfer retrieved successfully",
                StatusCode = 200,
                Data = new TransferResponseDTO
                {
                    Id = transfer.Id,
                    Amount = transfer.Amount,
                    TransferDateTime = transfer.TransferDateTime,
                    FromAccountId = transfer.FromAccountId,
                    FromAccountName = transfer.FromAccount.Name,
                    ToAccountId = transfer.ToAccountId,
                    ToAccountName = transfer.ToAccount.Name,
                    Description = transfer.Description,
                    ReferenceNumber = transfer.ReferenceNumber,
                    DebitTransactionId = transfer.DebitTransactionId,
                    CreditTransactionId = transfer.CreditTransactionId
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<TransferResponseDTO>
            {
                Success = false,
                Message = $"An error occurred while retrieving the transfer: {ex.Message}",
                StatusCode = 500
            };
        }
    }
}
