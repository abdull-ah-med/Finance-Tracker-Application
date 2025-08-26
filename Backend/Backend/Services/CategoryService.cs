using System;
using Backend.Data;
using Backend.DTO;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<ServiceResult<List<CategoryDTO>>> GetAccountCategoriesAsync()
    {
        try
        {
            var categories = await _context.AccountCategories
                .Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();

            return new ServiceResult<List<CategoryDTO>>
            {
                Success = true,
                StatusCode = 200,
                Data = categories
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<List<CategoryDTO>>
            {
                Success = false,
                Message = ex.Message,
                StatusCode = 500
            };
        }
    }

    public async Task<ServiceResult<List<CategoryDTO>>> GetTransactionCategoriesAsync()
    {
        try
        {
            var categories = await _context.TransactionCategories
                .Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();

            return new ServiceResult<List<CategoryDTO>>
            {
                Success = true,
                StatusCode = 200,
                Data = categories
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<List<CategoryDTO>>
            {
                Success = false,
                Message = ex.Message,
                StatusCode = 500
            };
        }
    }
}
