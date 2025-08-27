using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Transfer
{
    public int Id { get; set; }
    
    [Required]
    [Range(0.01, 1000000000, ErrorMessage = "Transfer amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    public DateTime TransferDateTime { get; set; }
    
    [Required]
    public int FromAccountId { get; set; }
    
    [Required]
    public int ToAccountId { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    public string Description { get; set; } = string.Empty;
    
    // Reference number for linking the two transaction records
    [Required]
    public string ReferenceNumber { get; set; } = string.Empty;
    
    // Navigation properties
    [ForeignKey("FromAccountId")]
    public Account FromAccount { get; set; } = null!;
    
    [ForeignKey("ToAccountId")]
    public Account ToAccount { get; set; } = null!;
    
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
    
    // The two transaction IDs that were created for this transfer
    public int? DebitTransactionId { get; set; }
    public int? CreditTransactionId { get; set; }
    
    [ForeignKey("DebitTransactionId")]
    public Transaction? DebitTransaction { get; set; }
    
    [ForeignKey("CreditTransactionId")]
    public Transaction? CreditTransaction { get; set; }
}
