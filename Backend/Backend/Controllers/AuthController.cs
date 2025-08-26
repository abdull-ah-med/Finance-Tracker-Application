using System;
using System.CodeDom.Compiler;
using Backend.DTO;
using Backend.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]

public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] UserSigninDTO userSigninDto)
    {
        AuthResponse response = await authService.LoginAsync(userSigninDto);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(30)
        };
        Response.Cookies.Append("auth_token", response.Token, cookieOptions);

        return Ok(response);
    }
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] UserSignupDTO userSignupDto)
    {
        AuthResponse response = await authService.RegisterAsync(userSignupDto);
        // Log the response for debugging
        Console.WriteLine("[SignUp] AuthResponse: " + System.Text.Json.JsonSerializer.Serialize(response));
        if (!response.Success)
        {
            return BadRequest(response);
        }
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(30)
        };
        Response.Cookies.Append("auth_token", response.Token, cookieOptions);
        return Ok(response);
    }
    [HttpGet("me")]
    [Authorize]
   public IActionResult VerifyUser()
    {
        if (User?.Identity?.IsAuthenticated == true)
        {
            var user = new UserResponseDTO
            {
                FullName = User.Identity?.Name,
                Email = User.FindFirst(ClaimTypes.Email)?.Value
            };
            var response = new AuthResponse
            {
                Success = true,
                Message = "User Authenticated",
                User = user,
            };

            return Ok(response);
        }

        return BadRequest("User Not Authenticated");
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("auth_token");

        return Ok(new { Success = true, Message = "Logged out successfully" });
    }

}
