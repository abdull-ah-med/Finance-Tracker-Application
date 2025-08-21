using System;
using Backend.DTO;

namespace Backend.Services;

public interface ITransactionService
{
    Task<ServiceResult<ResponseTransactionDTO>> CreateTransactionAsync(CreateTransactionDTO createTransactionDTO, int userID);
    Task<ServiceResult<TransactionResponseListDTO>> GetTransactions(int userID);
    Task<ServiceResult<TransactionResponseListDTO>> GetTransactions(int userID, int accountID);
    Task<ServiceResult<TransactionResponseListDTO>> GetTransactions(int userID, int accountID, int TransactionCategoryId);

}
