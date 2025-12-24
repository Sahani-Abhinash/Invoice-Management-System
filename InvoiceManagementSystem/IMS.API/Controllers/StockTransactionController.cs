using IMS.Application.DTOs.Warehouses;
using IMS.Application.Managers.Warehouses;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockTransactionController : ControllerBase
    {
        /// <summary>
        /// Manager for stock transaction operations.
        /// </summary>
        private readonly IStockTransactionManager _manager;

        /// <summary>
        /// Create controller.
        /// </summary>
        public StockTransactionController(IStockTransactionManager manager)
        {
            _manager = manager;
        }

        /// <summary>
        /// Get all stock transactions.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get stock transaction by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _manager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get transactions for a warehouse.
        /// </summary>
        [HttpGet("warehouse/{warehouseId}")]
        public async Task<IActionResult> GetByWarehouseId(Guid warehouseId)
        {
            var result = await _manager.GetByWarehouseIdAsync(warehouseId);
            return Ok(result);
        }

        /// <summary>
        /// Get transactions for an item.
        /// </summary>
        [HttpGet("item/{itemId}")]
        public async Task<IActionResult> GetByItemId(Guid itemId)
        {
            var result = await _manager.GetByItemIdAsync(itemId);
            return Ok(result);
        }

        /// <summary>
        /// Create a stock transaction.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStockTransactionDto dto)
        {
            var created = await _manager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Delete a stock transaction (soft-delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _manager.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
