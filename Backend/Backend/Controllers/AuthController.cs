using System;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

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
            return BadRequest();
        }
        return Ok(response);
    }
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] UserSignupDTO userSignupDto)
    {
        AuthResponse response = await authService.RegisterAsync(userSignupDto);
        if (!response.Success)
        {
            return BadRequest();
        }
        return Ok(response);
    }

}
