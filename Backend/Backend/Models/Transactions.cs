using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Transactions;

namespace Backend.Models;

public class Transaction
{
    public int Id { get; set; }
    [Required] public decimal Amount { get; set; }
    [Required] public DateTime TransactionDateTime { get; set; }
    [Required] public int TransactionCategoryId { get; set; }
    [Required] public int AccountId { get; set; }
    [Required] public char TransactionType { get; set; }
    public string Description { get; set; } = string.Empty;
    [ForeignKey("AccountId")] public Account Account { get; set; } = null!;
    [ForeignKey("TransactionCategoryId")] public TransactionCategory TransactionCategory { get; set; } = null!;
}
