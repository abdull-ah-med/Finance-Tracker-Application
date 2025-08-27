using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.DTO;
using Backend.Models;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;
    public AuthService(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }
    private string GenerateJwtToken(UserResponseDTO userResponseDTO, int userId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var claims = new[]{
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, userResponseDTO.FullName),
            new Claim(ClaimTypes.Email, userResponseDTO.Email.ToLower())
        };
        var token = new JwtSecurityToken(_configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.Now.AddDays(Convert.ToDouble(_configuration["Jwt:Expiration"])),
            signingCredentials: credentials);
        return tokenHandler.WriteToken(token);
    }
    
    public async Task<AuthResponse> LoginAsync(UserSigninDTO userSigninDTO)
    {
        try
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userSigninDTO.Email.ToLower());
            if (user == null || !BCrypt.Net.BCrypt.Verify(userSigninDTO.Password, user.HashedPassword))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }
            var userResponseDTO = new UserResponseDTO
            {
                FullName = user.FullName,
                Email = user.Email.ToLower(),
            };
            return new AuthResponse
            {
                Success = true,
                Message = "Login successful.",
                Token = GenerateJwtToken(userResponseDTO, user.Id), // ← Pass user.Id
                User = userResponseDTO
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "An error occurred while logging in."
            };
        }
    }
    public async Task<AuthResponse> RegisterAsync(UserSignupDTO userSignupDTO)
    {
        try
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userSignupDTO.Email.ToLower());
            if (user != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "User Already Exists"
                };
            }
            string HashedPassword = BCrypt.Net.BCrypt.HashPassword(userSignupDTO.Password);
            var newUser = new User
            {
                FullName = userSignupDTO.FullName,
                Email = userSignupDTO.Email.ToLower(),
                HashedPassword = HashedPassword,
            };
            await _dbContext.Users.AddAsync(newUser);
            await _dbContext.SaveChangesAsync();
            var userResponseDTO = new UserResponseDTO
            {
                FullName = newUser.FullName,
                Email = newUser.Email.ToLower(),
            };
            return new AuthResponse
            {
                Success = true,
                Message = "SignUp successful.",
                Token = GenerateJwtToken(userResponseDTO, newUser.Id), // ← Pass newUser.Id
                User = userResponseDTO
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "An error occurred while registering the user."
            };
        }
    }
    public Task<bool> UserExistsAsync(string email)
    {
        return _dbContext.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<ServiceResult<UserResponseDTO>> UpdateUserAsync(UserUpdateDTO userUpdateDTO, int userId)
    {
        try
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return new ServiceResult<UserResponseDTO>
                {
                    Success = false,
                    Message = "User not found",
                    StatusCode = 404
                };
            }

            // Check if email is already taken by another user
            if (!string.IsNullOrEmpty(userUpdateDTO.Email) && userUpdateDTO.Email.ToLower() != user.Email.ToLower())
            {
                var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userUpdateDTO.Email.ToLower() && u.Id != userId);
                if (existingUser != null)
                {
                    return new ServiceResult<UserResponseDTO>
                    {
                        Success = false,
                        Message = "Email is already taken by another user",
                        StatusCode = 409
                    };
                }
            }

            // Update only the name (email should not be updated as per requirements)
            if (!string.IsNullOrEmpty(userUpdateDTO.FullName))
            {
                user.FullName = userUpdateDTO.FullName;
            }

            await _dbContext.SaveChangesAsync();

            var userResponseDTO = new UserResponseDTO
            {
                FullName = user.FullName,
                Email = user.Email
            };

            return new ServiceResult<UserResponseDTO>
            {
                Success = true,
                Message = "User updated successfully",
                StatusCode = 200,
                Data = userResponseDTO
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<UserResponseDTO>
            {
                Success = false,
                Message = "An error occurred while updating the user",
                StatusCode = 500
            };
        }
    }
}
