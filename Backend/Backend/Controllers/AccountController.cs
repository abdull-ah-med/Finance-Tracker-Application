using System;
using System.Security.Claims;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("/api/user/accounts")]
class AccountController(IAccountService AS) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountDTO createAccountDTO)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            if (userId > 0)
            {
                var actionResult = await AS.CreateAccountAsync(createAccountDTO, userId);
                return StatusCode(actionResult.StatusCode, actionResult);
            }
            else
            {
                return BadRequest("User not authorized");
            }
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            if (userId > 0)
            {
                var actionResult = await AS.UpdateAccountAsync(updateAccountDTO, userId);
                return StatusCode(actionResult.StatusCode, actionResult);
            }
            else
            {
                return BadRequest("User not authorized");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex);
        }
    }

}