using IMS.Application.DTOs.Pricing;
using IMS.Application.Managers.Pricing;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PriceListController : ControllerBase
    {
        /// <summary>
        /// Price list manager.
        /// </summary>
        private readonly IPriceListManager _manager;

        /// <summary>
        /// Create PriceListController.
        /// </summary>
        public PriceListController(IPriceListManager manager)
        {
            _manager = manager;
        }

        /// <summary>
        /// Get all price lists.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get price list by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _manager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Create a price list.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePriceListDto dto)
        {
            var created = await _manager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Update a price list.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreatePriceListDto dto)
        {
            var updated = await _manager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete a price list (soft-delete).
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
