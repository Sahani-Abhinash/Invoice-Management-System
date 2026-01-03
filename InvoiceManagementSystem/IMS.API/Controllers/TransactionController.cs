using IMS.Application.DTOs.Transaction;
using IMS.Application.Interfaces.Transaction;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var transactions = await _transactionService.GetAllAsync();
            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        [HttpGet("source/{sourceType}/{sourceId}")]
        public async Task<IActionResult> GetBySource(string sourceType, string sourceId)
        {
            var transactions = await _transactionService.GetBySourceAsync(sourceType, sourceId);
            return Ok(transactions);
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            var transactions = await _transactionService.GetByCategoryAsync(category);
            return Ok(transactions);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _transactionService.GetSummaryAsync();
            return Ok(summary);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTransactionDto dto)
        {
            var transaction = await _transactionService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _transactionService.DeleteAsync(id);
            if (!result)
                return BadRequest("Only manual transactions can be deleted.");

            return NoContent();
        }
    }
}
