using System;

namespace Backend.DTO;

public class ResponseTransactionDTO
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime TransactionDateTime { get; set; }
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public int TransactionCategoryId { get; set; }
    public string TransactionCategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
}