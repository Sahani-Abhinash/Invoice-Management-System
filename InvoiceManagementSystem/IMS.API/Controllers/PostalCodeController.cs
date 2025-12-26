using IMS.Application.DTOs.Geography;
using IMS.Application.Managers.Geography;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostalCodeController : ControllerBase
    {
        private readonly IGeographyManager _manager;

        public PostalCodeController(IGeographyManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _manager.GetAllPostalCodesAsync();
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _manager.GetPostalCodeByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PostalCodeDto dto)
        {
            var created = await _manager.CreatePostalCodeAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] PostalCodeDto dto)
        {
            var updated = await _manager.UpdatePostalCodeAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _manager.DeletePostalCodeAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
