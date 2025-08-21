using System;
using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace Backend.Services;

public class AccountService : IAccountService
{
    private readonly AppDbContext _context;
    public AccountService(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }
    public async Task<User> GetUserAsync(int userId)
    {
        var user = await _context.Users.Include(u => u.Accounts).ThenInclude(u => u.AccountCategory).FirstOrDefaultAsync(u => u.Id == userId);
        return user;
    }
    public async Task<Account> GetAccountAsync(string accountName, int accountCategoryId, int userId)
    {
        return await _context.Accounts.FirstOrDefaultAsync(a => a.Name == accountName && a.AccountCategoryId == accountCategoryId && a.UserId == userId);

    }
    public async Task<Account> GetAccountAsync(UpdateAccountDTO updateAccountDto, int userId)
    {
        return await _context.Accounts.FirstOrDefaultAsync(a => a.Id == updateAccountDto.Id && a.UserId == userId);
    }
    public async Task<ServiceResult<AccountResponseDTO>> CreateAccountAsync(CreateAccountDTO createAccountDTO, int userId)
    {
        try
        {
            var user = await GetUserAsync(userId);
            if (user == null)
            {
                return new ServiceResult<AccountResponseDTO>
                {
                    Success = false,
                    Message = "User not found",
                    StatusCode = 404
                };
            }
            if (user.Accounts.Any(a => a.Name == createAccountDTO.Name && a.AccountCategoryId == createAccountDTO.AccountCategoryId))
            {
                return new ServiceResult<AccountResponseDTO>
                {
                    Success = false,
                    Message = "Account with similar name and category already exists",
                    StatusCode = 409
                };
            }
            var newAccount = new Account
            {
                Name = createAccountDTO.Name,
                AccountCategoryId = createAccountDTO.AccountCategoryId,
                Balance = 0,
                UserId = userId
            };
            await _context.Accounts.AddAsync(newAccount);
            await _context.SaveChangesAsync();
            await _context.Entry(newAccount).Reference(a => a.AccountCategory).LoadAsync();
            return new ServiceResult<AccountResponseDTO>
            {
                Success = true,
                Message = "Account Successfully Created",
                Data = new AccountResponseDTO
                {
                    Id = newAccount.Id,
                    Name = newAccount.Name,
                    AccountCategoryId = newAccount.AccountCategoryId,
                    AccountCategoryName = newAccount.AccountCategory.Name,
                    Balance = newAccount.Balance,
                },
                StatusCode = 201
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<AccountResponseDTO>
            {
                Success = false,
                Message = ex.Message,
                StatusCode = 500
            };
        }
    }
    public async Task<ServiceResult<AccountResponseDTO>> UpdateAccountAsync(UpdateAccountDTO updateAccountDTO, int userId)
    {
        try
        {
            var user = await GetUserAsync(userId);
            if (user == null)
            {
                return new ServiceResult<AccountResponseDTO>
                {
                    Success = false,
                    Message = "User not found",
                    StatusCode = 404
                };
            }
            var accountExists = await GetAccountAsync(updateAccountDTO, userId);
            if (accountExists == null)
            {
                return new ServiceResult<AccountResponseDTO>
                {
                    Success = false,
                    Message = "Account does not Exists",
                    StatusCode = 404

                };
            }
            if (await GetAccountAsync(updateAccountDTO.Name, updateAccountDTO.AccountCategoryId, userId) != null)
            {
                return new ServiceResult<AccountResponseDTO>
                {
                    Success = false,
                    Message = "Account with similar name already exists",
                    StatusCode = 409

                };
            }
            accountExists.Name = updateAccountDTO.Name;
            accountExists.AccountCategoryId = updateAccountDTO.AccountCategoryId;
            await _context.SaveChangesAsync();
            await _context.Entry(accountExists).Reference(a => a.AccountCategory).LoadAsync();
            return new ServiceResult<AccountResponseDTO>
            {
                Success = true,
                Message = "Account Successfully Updated",
                Data = new AccountResponseDTO
                {
                    Id = accountExists.Id,
                    Name = accountExists.Name,
                    AccountCategoryId = accountExists.AccountCategoryId,
                    AccountCategoryName = accountExists.AccountCategory.Name,
                    Balance = accountExists.Balance,
                },
                StatusCode = 201
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<AccountResponseDTO>
            {
                Success = false,
                Message = ex.Message,
                StatusCode = 500
            };
        }
    }
}
