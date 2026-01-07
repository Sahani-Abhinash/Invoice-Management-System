using IMS.Application.DTOs.Product;
using IMS.Application.Managers.Product;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductPropertyController : ControllerBase
    {
        private readonly IProductPropertyManager _manager;

        public ProductPropertyController(IProductPropertyManager manager)
        {
            _manager = manager;
        }

        /// <summary>
        /// Get all product properties.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get product property by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _manager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Create a product property.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductPropertyDto dto)
        {
            var result = await _manager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        /// <summary>
        /// Update a product property.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateProductPropertyDto dto)
        {
            var result = await _manager.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Delete a product property.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _manager.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
