using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class User
{
    public int Id { get; set; }
    [Required][Length(3, maximumLength: 100)] public string FullName { get; set; } = string.Empty;
    [Required][EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string HashedPassword { get; set; } = string.Empty;
    public ICollection<Account> Accounts { get; set; } = new List<Account>();

}
