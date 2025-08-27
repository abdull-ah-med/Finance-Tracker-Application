using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTO;

public class CreateTransferDTO
{
    [Required]
    [Range(0.01, 1000000000, ErrorMessage = "Transfer amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    public DateTime TransferDateTime { get; set; }
    
    [Required]
    public int FromAccountId { get; set; }
    
    [Required]
    public int ToAccountId { get; set; }
    
    public string Description { get; set; } = string.Empty;
}
