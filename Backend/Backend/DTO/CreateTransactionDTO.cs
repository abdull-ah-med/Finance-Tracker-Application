using System;
using FluentValidation;

namespace Backend.DTO;

public class CreateTransactionDTO
{
    public decimal Amount { get; set; }
    public DateTime TransactionDateTime { get; set; }
    public int AccountId { get; set; }
    public int TransactionCategoryId { get; set; }
    public char TransactionType { get; set; }
    public string? Description { get; set; }
}
public class CreateTransactionDTOValidator : AbstractValidator<CreateTransactionDTO>
{
    public CreateTransactionDTOValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Transaction Amount can not be zero");
        RuleFor(x => x.AccountId).GreaterThan(0).WithMessage("Account Id Invalid");
        RuleFor(x => x.TransactionCategoryId).GreaterThan(0).WithMessage("Category Id Invalid");
        RuleFor(x => x.TransactionType)
            .NotEmpty().WithMessage("Transaction type is required")
            .Must(x => x == 'I' || x == 'E').WithMessage("Transaction type must be 'I' (Income) or 'E' (Expense)");
        RuleFor(x => x.TransactionDateTime)
            .LessThanOrEqualTo(DateTime.Now).WithMessage("Transaction date cannot be in the future")
            .GreaterThan(DateTime.Now.AddMonths(-12)).WithMessage("Transaction date cannot be older than 12 months");
    }
}
