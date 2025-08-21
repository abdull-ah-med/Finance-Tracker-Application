using System;

namespace Backend.DTO;

public class AccountResponseDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int AccountCategoryId { get; set; }
    public string AccountCategoryName { get; set; }
    public decimal Balance { get; set; }
}
