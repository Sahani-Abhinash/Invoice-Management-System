using IMS.Application.DTOs.Product;
using IMS.Application.Managers.Product;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemPropertyAttributeController : ControllerBase
    {
        private readonly IItemPropertyAttributeManager _manager;

        public ItemPropertyAttributeController(IItemPropertyAttributeManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<ActionResult<List<ItemPropertyAttributeDto>>> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemPropertyAttributeDto>> GetById(Guid id)
        {
            try
            {
                var result = await _manager.GetByIdAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("item/{itemId}")]
        public async Task<ActionResult<List<ItemPropertyAttributeDto>>> GetByItemId(Guid itemId)
        {
            var result = await _manager.GetByItemIdAsync(itemId);
            return Ok(result);
        }

        [HttpGet("attribute/{propertyAttributeId}")]
        public async Task<ActionResult<List<ItemPropertyAttributeDto>>> GetByPropertyAttributeId(Guid propertyAttributeId)
        {
            var result = await _manager.GetByPropertyAttributeIdAsync(propertyAttributeId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ItemPropertyAttributeDto>> Create([FromBody] CreateItemPropertyAttributeDto dto)
        {
            try
            {
                var result = await _manager.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ItemPropertyAttributeDto>> Update(Guid id, [FromBody] UpdateItemPropertyAttributeDto dto)
        {
            try
            {
                if (id != dto.Id)
                    return BadRequest(new { message = "ID mismatch" });

                var result = await _manager.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> Delete(Guid id)
        {
            var result = await _manager.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = $"ItemPropertyAttribute with ID {id} not found" });

            return Ok(new { message = "ItemPropertyAttribute deleted successfully" });
        }

        [HttpDelete("item/{itemId}")]
        public async Task<ActionResult<bool>> DeleteByItemId(Guid itemId)
        {
            var result = await _manager.DeleteByItemIdAsync(itemId);
            if (!result)
                return NotFound(new { message = $"No ItemPropertyAttributes found for Item {itemId}" });

            return Ok(new { message = "ItemPropertyAttributes deleted successfully" });
        }
    }
}
