using System;

namespace Backend.DTO;

public class TransactionResponseListDTO
{
    public List<ResponseTransactionDTO> Transactions { get; set; } = new List<ResponseTransactionDTO>();
    public int TotalCount { get; set; }
}
