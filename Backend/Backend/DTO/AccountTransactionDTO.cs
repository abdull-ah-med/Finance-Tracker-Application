using System;
using FluentValidation;

namespace Backend.DTO;

public class AccountTransactionDTO
{
    public int Id{ get; set; }
    public decimal Amount { get; set; }
    public DateTime TransactionDateTime { get; set; }
    public int SenderAccountId { get; set; }
    public int ReceiverAccountId { get; set; }
    public int TransactionCategoryId { get; set; }
    public string? Description { get; set; }
}
public class AccountTransactionDTOValidator : AbstractValidator<AccountTransactionDTO>
{
    public AccountTransactionDTOValidator()
    {

        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Invalid Transaction Id");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Transaction Amount can not be zero");
        RuleFor(x => x.SenderAccountId).GreaterThan(0).WithMessage("Sender Account Id Invalid");
        RuleFor(x => x.ReceiverAccountId).GreaterThan(0).WithMessage("Receiver Account Id Invalid");
        RuleFor(x => x.TransactionCategoryId).GreaterThan(0).WithMessage("Category Id Invalid");
        RuleFor(x => x.TransactionDateTime)
            .LessThanOrEqualTo(DateTime.Now).WithMessage("Transaction date cannot be in the future")
            .GreaterThan(DateTime.Now.AddMonths(-12)).WithMessage("Transaction date cannot be older than 12 months");
    }
}
