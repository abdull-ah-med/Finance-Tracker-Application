using System;

namespace Backend.DTO;

public class TransferResponseDTO
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime TransferDateTime { get; set; }
    public int FromAccountId { get; set; }
    public string FromAccountName { get; set; } = string.Empty;
    public int ToAccountId { get; set; }
    public string ToAccountName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public int? DebitTransactionId { get; set; }
    public int? CreditTransactionId { get; set; }
}
