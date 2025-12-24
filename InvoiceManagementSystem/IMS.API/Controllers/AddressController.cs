using IMS.Application.DTOs.Common;
using IMS.Application.Interfaces.Common;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        /// <summary>
        /// Address service used to manage addresses.
        /// </summary>
        private readonly IAddressService _service;

        /// <summary>
        /// Create AddressController.
        /// </summary>
        public AddressController(IAddressService service)
        {
            _service = service;
        }

        /// <summary>
        /// Get all addresses.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        /// <summary>
        /// Get address by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var a = await _service.GetByIdAsync(id);
            if (a == null) return NotFound();
            return Ok(a);
        }

        /// <summary>
        /// Create a new address.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAddressDto dto)
        {
            var a = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = a.Id }, a);
        }

        /// <summary>
        /// Update an address.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateAddressDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete an address (soft-delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }

        /// <summary>
        /// Link an address to an owner.
        /// </summary>
        [HttpPost("link")]
        public async Task<IActionResult> Link([FromQuery] Guid addressId, [FromQuery] string ownerType, [FromQuery] Guid ownerId, [FromQuery] bool primary = false)
        {
            if (!System.Enum.TryParse<IMS.Domain.Enums.OwnerType>(ownerType, true, out var ot)) return BadRequest("Invalid ownerType");
            var ok = await _service.LinkToOwnerAsync(addressId, ot, ownerId, primary);
            if (!ok) return NotFound();
            return NoContent();
        }

        /// <summary>
        /// Unlink an address from an owner.
        /// </summary>
        [HttpPost("unlink")]
        public async Task<IActionResult> Unlink([FromQuery] Guid addressId, [FromQuery] string ownerType, [FromQuery] Guid ownerId)
        {
            if (!System.Enum.TryParse<IMS.Domain.Enums.OwnerType>(ownerType, true, out var ot)) return BadRequest("Invalid ownerType");
            var ok = await _service.UnlinkFromOwnerAsync(addressId, ot, ownerId);
            if (!ok) return NotFound();
            return NoContent();
        }

        /// <summary>
        /// Get addresses for a specific owner.
        /// </summary>
        [HttpGet("owner/{ownerType}/{ownerId}")]
        public async Task<IActionResult> GetForOwner(string ownerType, Guid ownerId)
        {
            if (!System.Enum.TryParse<IMS.Domain.Enums.OwnerType>(ownerType, true, out var ot)) return BadRequest("Invalid ownerType");
            var list = await _service.GetForOwnerAsync(ot, ownerId);
            return Ok(list);
        }
    }
}
