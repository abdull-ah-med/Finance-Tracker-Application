using System.Security.Claims;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/user/transactions")]
[ApiController]
[Authorize]
public class TransactionController(ITransactionService TS) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateTransactionAsync([FromBody] CreateTransactionDTO createTransactionDTO)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return BadRequest("Request Unauthorized");
            }

            var createTransactionResult = await TS.CreateTransactionAsync(createTransactionDTO, userId);
            return StatusCode(createTransactionResult.StatusCode, createTransactionResult);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = "An unexpected error occurred",
                Details = ex.Message
            });
        }
    }
    [HttpGet("fetch")]
    public async Task<IActionResult> GetTransactionAsync([FromQuery] int? accountId, int? TransactionCategoryId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return BadRequest("Request Unauthorized");
            }

            if (accountId > 0 && TransactionCategoryId > 0)
            {
                var transactionServiceResult = await TS.GetTransactions(userId, accountId.Value, TransactionCategoryId.Value);
                return StatusCode(transactionServiceResult.StatusCode, transactionServiceResult);
            }
            else if (accountId > 0)
            {
                var transactionServiceResult = await TS.GetTransactions(userId, accountId.Value);
                return StatusCode(transactionServiceResult.StatusCode, transactionServiceResult);
            }
            else
            {
                var transactionServiceResult = await TS.GetTransactions(userId);
                return StatusCode(transactionServiceResult.StatusCode, transactionServiceResult);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex);
        }
    }

}

