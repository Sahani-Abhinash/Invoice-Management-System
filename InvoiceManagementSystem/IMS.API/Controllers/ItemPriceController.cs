using IMS.Application.DTOs.Product;
using IMS.Application.Managers.Product;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemPriceController : ControllerBase
    {
        private readonly IItemPriceManager _manager;

        public ItemPriceController(IItemPriceManager manager)
        {
            _manager = manager;
        }

        /// <summary>
        /// Get all item prices.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get item price by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _manager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get prices for an item.
        /// </summary>
        [HttpGet("item/{itemId}")]
        public async Task<IActionResult> GetByItemId(Guid itemId)
        {
            var result = await _manager.GetByItemIdAsync(itemId);
            return Ok(result);
        }

        /// <summary>
        /// Get prices for a price list.
        /// </summary>
        [HttpGet("pricelist/{priceListId}")]
        public async Task<IActionResult> GetByPriceListId(Guid priceListId)
        {
            var result = await _manager.GetByPriceListIdAsync(priceListId);
            return Ok(result);
        }

        /// <summary>
        /// Create an item price.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateItemPriceDto dto)
        {
            var created = await _manager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Update an item price.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateItemPriceDto dto)
        {
            var updated = await _manager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete an item price (soft-delete).
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
