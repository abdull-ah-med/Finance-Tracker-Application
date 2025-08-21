using System;
using FluentValidation;
namespace Backend.DTO;

public class UserSigninDTO
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
public class UserSigninDTOValidator : AbstractValidator<UserSigninDTO>
{
    public UserSigninDTOValidator()
    {
        RuleFor(x => x.Email).EmailAddress().NotEmpty().WithMessage("Invalid Email");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(40).WithMessage("Invalid Password");
    }
}