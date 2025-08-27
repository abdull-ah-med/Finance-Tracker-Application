using System;
using System.Threading.Tasks;
using Backend.DTO;

namespace Backend.Services;

public interface ITransferService
{
    Task<ServiceResult<TransferResponseDTO>> CreateTransferAsync(CreateTransferDTO createTransferDTO, int userId);
    Task<ServiceResult<TransferResponseListDTO>> GetTransfersAsync(int userId);
    Task<ServiceResult<TransferResponseDTO>> GetTransferAsync(int transferId, int userId);
}
