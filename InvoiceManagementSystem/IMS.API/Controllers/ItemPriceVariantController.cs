using IMS.Application.DTOs.Product;
using IMS.Application.Managers.Product;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemPriceVariantsController : ControllerBase
    {
        private readonly IItemPriceVariantManager _manager;

        public ItemPriceVariantsController(IItemPriceVariantManager manager)
        {
            _manager = manager;
        }

        /// <summary>
        /// Get all item price variants
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ItemPriceVariantDto>>> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get a specific variant by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ItemPriceVariantDto>> GetById(Guid id)
        {
            try
            {
                var result = await _manager.GetByIdAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        /// <summary>
        /// Get all variants for a specific ItemPrice
        /// Usage: GET /api/itempricevariants/itemprice/[itemPriceId]
        /// This is useful for shopping cart - get all variants for a product price
        /// </summary>
        [HttpGet("itemprice/{itemPriceId}")]
        public async Task<ActionResult<List<ItemPriceVariantDto>>> GetByItemPriceId(Guid itemPriceId)
        {
            var result = await _manager.GetByItemPriceIdAsync(itemPriceId);
            return Ok(result);
        }

        /// <summary>
        /// Get all ItemPrices that have a specific property variant
        /// Usage: GET /api/itempricevariants/propertyattribute/[attributeId]
        /// This is useful for filtering products by a specific variant value (e.g., "Red" color)
        /// </summary>
        [HttpGet("propertyattribute/{propertyAttributeId}")]
        public async Task<ActionResult<List<ItemPriceVariantDto>>> GetByPropertyAttributeId(Guid propertyAttributeId)
        {
            var result = await _manager.GetByPropertyAttributeIdAsync(propertyAttributeId);
            return Ok(result);
        }

        /// <summary>
        /// Create a new variant for an ItemPrice
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ItemPriceVariantDto>> Create([FromBody] CreateItemPriceVariantDto dto)
        {
            try
            {
                var result = await _manager.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Update an existing variant
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ItemPriceVariantDto>> Update(Guid id, [FromBody] UpdateItemPriceVariantDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest("ID mismatch");
            }

            try
            {
                var result = await _manager.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Delete a specific variant
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> Delete(Guid id)
        {
            var result = await _manager.DeleteAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return Ok(true);
        }

        /// <summary>
        /// Delete all variants for a specific ItemPrice
        /// Usage: DELETE /api/itempricevariants/itemprice/[itemPriceId]
        /// </summary>
        [HttpDelete("itemprice/{itemPriceId}")]
        public async Task<ActionResult<bool>> DeleteByItemPriceId(Guid itemPriceId)
        {
            var result = await _manager.DeleteByItemPriceIdAsync(itemPriceId);
            if (!result)
            {
                return NotFound();
            }
            return Ok(true);
        }
    }
}
