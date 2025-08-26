using System;
using Backend.Models;

namespace Backend.DTO;

public class AccountResponseListDTO
{
    public List<AccountResponseDTO> Accounts { get; set; } = new List<AccountResponseDTO>();
    public int TotalCount { get; set; }
}
