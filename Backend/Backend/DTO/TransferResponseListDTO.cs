using System.Collections.Generic;

namespace Backend.DTO;

public class TransferResponseListDTO
{
    public IEnumerable<TransferResponseDTO> Transfers { get; set; } = new List<TransferResponseDTO>();
    public int TotalCount { get; set; }
}
