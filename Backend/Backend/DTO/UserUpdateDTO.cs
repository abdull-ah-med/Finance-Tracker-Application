using System;
using Backend.Models;
using FluentValidation;

namespace Backend.DTO;

public class UserUpdateDTO
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;

}
public class UserUpdateDTOValidation : AbstractValidator<UserUpdateDTO>
{
    public UserUpdateDTOValidation()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Email is required and must be a valid email address.");
        RuleFor(x => x.FullName).NotEmpty().MinimumLength(3).WithMessage("Invalid Full Name");
    }
}
