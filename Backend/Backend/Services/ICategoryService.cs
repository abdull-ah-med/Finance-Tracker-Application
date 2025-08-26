using System;
using Backend.DTO;

namespace Backend.Services;

public interface ICategoryService
{
    Task<ServiceResult<List<CategoryDTO>>> GetAccountCategoriesAsync();
    Task<ServiceResult<List<CategoryDTO>>> GetTransactionCategoriesAsync();
}
