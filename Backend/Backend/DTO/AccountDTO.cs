using System;
using System.ComponentModel.DataAnnotations;
using Backend.Models;
using FluentValidation;

namespace Backend.DTO;

public class CreateAccountDTO
{
    public string Name { get; set; } = string.Empty;
    public int AccountCategoryId { get; set; }

}
public class UpdateAccountDTO : CreateAccountDTO
{
    public int Id { get; set; }

}
public class CreateAccountDTOValidator : AbstractValidator<CreateAccountDTO>
{
    public CreateAccountDTOValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is Required").MaximumLength(20).WithMessage("Name can not exceed 20 character");
        RuleFor(x => x.AccountCategoryId).GreaterThan(0).WithMessage("Account Category ID Invalid");
    }
}
public class UpdateAccountDTOValidator : AbstractValidator<UpdateAccountDTO>
{
    public UpdateAccountDTOValidator()
    {
        RuleFor(x => x.Id).NotEmpty().GreaterThan(0).WithMessage("Account ID Invalid");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is Required").MaximumLength(20).WithMessage("Name can not exceed 20 character");
        RuleFor(x => x.AccountCategoryId).GreaterThan(0).WithMessage("Account Category ID Invalid");
    }
}