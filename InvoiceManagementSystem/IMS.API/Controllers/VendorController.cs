using IMS.Application.DTOs.Companies;
using IMS.Application.Managers.Companies;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VendorController : ControllerBase
    {
        private readonly IVendorManager _manager;

        public VendorController(IVendorManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _manager.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id) { var r = await _manager.GetByIdAsync(id); if (r==null) return NotFound(); return Ok(r);} 

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVendorDto dto) { var created = await _manager.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = created.Id }, created); }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateVendorDto dto) { var updated = await _manager.UpdateAsync(id, dto); if (updated==null) return NotFound(); return Ok(updated); }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id) { var ok = await _manager.DeleteAsync(id); if (!ok) return NotFound(); return NoContent(); }
    }
}
