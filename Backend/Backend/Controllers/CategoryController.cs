using System;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccountCategories()
    {
        try
        {
            var result = await _categoryService.GetAccountCategoriesAsync();
            return StatusCode(result.StatusCode, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactionCategories()
    {
        try
        {
            var result = await _categoryService.GetTransactionCategoriesAsync();
            return StatusCode(result.StatusCode, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}
