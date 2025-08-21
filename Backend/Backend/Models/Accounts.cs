using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Transactions;

namespace Backend.Models;

public class Account
{
    public int Id { get; set; }
    [Required] public string Name { get; set; } = string.Empty;
    [Required][Range(0, 1000000000, ErrorMessage = "Balance should be in Range")] public decimal Balance { get; set; }
    [Required] public int UserId { get; set; }
    [ForeignKey("UserId")] public User User { get; set; }
    [Required] public int AccountCategoryId { get; set; }
    [ForeignKey("AccountCategoryId")] public AccountCategory AccountCategory { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
