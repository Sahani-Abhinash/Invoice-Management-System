using IMS.Application.DTOs.Warehouses;
using IMS.Application.Managers.Warehouses;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockController : ControllerBase
    {
        /// <summary>
        /// Stock manager to coordinate stock operations.
        /// </summary>
        private readonly IStockManager _stockManager;

        /// <summary>
        /// Creates a new instance of StockController.
        /// </summary>
        public StockController(IStockManager stockManager)
        {
            _stockManager = stockManager;
        }

        /// <summary>
        /// Get all stock records.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _stockManager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get stock by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _stockManager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get stocks for a specific warehouse.
        /// </summary>
        [HttpGet("warehouse/{warehouseId}")]
        public async Task<IActionResult> GetByWarehouseId(Guid warehouseId)
        {
            var result = await _stockManager.GetByWarehouseIdAsync(warehouseId);
            return Ok(result);
        }

        /// <summary>
        /// Create a stock record.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStockDto dto)
        {
            var created = await _stockManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Update a stock record.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateStockDto dto)
        {
            var updated = await _stockManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete a stock record (soft-delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _stockManager.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
