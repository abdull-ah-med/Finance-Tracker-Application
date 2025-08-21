using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class AccountCategory
{
    [Required] public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
