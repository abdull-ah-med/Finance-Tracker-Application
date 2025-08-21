using System;
using Backend.DTO;
using Backend.Models;

namespace Backend.Services;

public interface IAccountService
{
    Task<ServiceResult<AccountResponseDTO>> CreateAccountAsync(CreateAccountDTO createAccountDto, int userId);
    Task<ServiceResult<AccountResponseDTO>> UpdateAccountAsync(UpdateAccountDTO updateAccountDTO, int userId);

    Task<Account> GetAccountAsync(string accountName, int accountCategoryId, int userId);
    Task<User> GetUserAsync(int userId);
    Task<Account> GetAccountAsync(UpdateAccountDTO updateAccountDTO, int userId);

}

