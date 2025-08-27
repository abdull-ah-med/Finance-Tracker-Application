using System;
using Backend.DTO;

namespace Backend.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(UserSigninDTO userLoginDto);
    Task<AuthResponse> RegisterAsync(UserSignupDTO userCreateDto);
    Task<bool> UserExistsAsync(string email);
    Task<ServiceResult<UserResponseDTO>> UpdateUserAsync(UserUpdateDTO userUpdateDTO, int userId);
}
