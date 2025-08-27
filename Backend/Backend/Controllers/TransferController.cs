using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransferController : ControllerBase
{
    private readonly ITransferService _transferService;

    public TransferController(ITransferService transferService)
    {
        _transferService = transferService ?? throw new ArgumentNullException(nameof(transferService));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferDTO createTransferDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user ID in token");
        }

        var result = await _transferService.CreateTransferAsync(createTransferDTO, userId);

        return StatusCode(result.StatusCode, new
        {
            Success = result.Success,
            Message = result.Message,
            Data = result.Data
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetTransfers()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user ID in token");
        }

        var result = await _transferService.GetTransfersAsync(userId);

        return StatusCode(result.StatusCode, new
        {
            Success = result.Success,
            Message = result.Message,
            Data = result.Data
        });
    }

    [HttpGet("{transferId}")]
    public async Task<IActionResult> GetTransfer(int transferId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user ID in token");
        }

        var result = await _transferService.GetTransferAsync(transferId, userId);

        return StatusCode(result.StatusCode, new
        {
            Success = result.Success,
            Message = result.Message,
            Data = result.Data
        });
    }
}
