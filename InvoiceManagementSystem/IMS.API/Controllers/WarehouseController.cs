using IMS.Application.DTOs.Warehouses;
using IMS.Application.Managers.Warehouses;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehouseController : ControllerBase
    {
        private readonly IWarehouseManager _warehouseManager;

        public WarehouseController(IWarehouseManager warehouseManager)
        {
            _warehouseManager = warehouseManager;
        }

        /// <summary>
        /// Get all warehouses.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _warehouseManager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get warehouse by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _warehouseManager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get warehouses for a branch.
        /// </summary>
        [HttpGet("branch/{branchId}")]
        public async Task<IActionResult> GetByBranchId(Guid branchId)
        {
            var result = await _warehouseManager.GetByBranchIdAsync(branchId);
            return Ok(result);
        }

        /// <summary>
        /// Create a warehouse.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWarehouseDto dto)
        {
            var created = await _warehouseManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Update a warehouse.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateWarehouseDto dto)
        {
            var updated = await _warehouseManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete a warehouse (soft-delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _warehouseManager.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
