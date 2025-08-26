using System;
using System.Security.Claims;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/user/accounts")]
[Authorize]
public class AccountsController(IAccountService AS) : ControllerBase
{

    [HttpPost("create")]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountDTO createAccountDTO)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return BadRequest("User not authorized");
            }

            var actionResult = await AS.CreateAccountAsync(createAccountDTO, userId);
            return StatusCode(actionResult.StatusCode, actionResult);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex);
        }
    }
    [HttpPost("update")]
    public async Task<IActionResult> UpdateAccount([FromBody] UpdateAccountDTO updateAccountDTO)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return BadRequest("User not authorized");
            }

            var actionResult = await AS.UpdateAccountAsync(updateAccountDTO, userId);
            return StatusCode(actionResult.StatusCode, actionResult);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex);
        }
    }
    [HttpGet("list")]
    public async Task<IActionResult> GetAccounts()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized("User not authorized");
            }

            var actionResult = await AS.GetAccountsAsync(userId);
            return StatusCode(actionResult.StatusCode, actionResult);
        }
        catch (Exception)
        {
            return StatusCode(500, "An unexpected error occurred.");
        }
    }
    
}