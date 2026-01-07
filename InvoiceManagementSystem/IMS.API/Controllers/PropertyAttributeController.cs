using IMS.Application.DTOs.Product;
using IMS.Application.Managers.Product;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyAttributeController : ControllerBase
    {
        private readonly IPropertyAttributeManager _manager;

        public PropertyAttributeController(IPropertyAttributeManager manager)
        {
            _manager = manager;
        }

        /// <summary>
        /// Get all property attributes.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get property attributes by property id.
        /// </summary>
        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> GetByPropertyId(Guid propertyId)
        {
            var result = await _manager.GetByPropertyIdAsync(propertyId);
            return Ok(result);
        }

        /// <summary>
        /// Get property attribute by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _manager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Create a property attribute.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePropertyAttributeDto dto)
        {
            try
            {
                var result = await _manager.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Update a property attribute.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreatePropertyAttributeDto dto)
        {
            try
            {
                var result = await _manager.UpdateAsync(id, dto);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Delete a property attribute.
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
