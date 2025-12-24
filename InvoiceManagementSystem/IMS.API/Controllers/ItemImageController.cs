using IMS.Application.DTOs.Product;
using IMS.Application.Managers.Product;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemImageController : ControllerBase
    {
        private readonly IItemImageManager _manager;

        public ItemImageController(IItemImageManager manager)
        {
            _manager = manager;
        }

        /// <summary>
        /// Get all item images.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get item image by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _manager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get images for an item.
        /// </summary>
        [HttpGet("item/{itemId}")]
        public async Task<IActionResult> GetByItemId(Guid itemId)
        {
            var result = await _manager.GetByItemIdAsync(itemId);
            return Ok(result);
        }

        /// <summary>
        /// Create an item image.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateItemImageDto dto)
        {
            var created = await _manager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Update an item image.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateItemImageDto dto)
        {
            var updated = await _manager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete an item image (soft-delete).
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
