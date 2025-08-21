using System;
using FluentValidation;

namespace Backend.DTO;

public class UserSignupDTO
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

}
public class UserSignupDTOValidator : AbstractValidator<UserSignupDTO>
{
    public UserSignupDTOValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100).MinimumLength(4).WithMessage("Invalid Name");
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Invalid Email");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100).WithMessage("Password does not fullfill requirements");
    }
}