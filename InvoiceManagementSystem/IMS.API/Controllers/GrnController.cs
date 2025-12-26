using IMS.Application.DTOs.Warehouses;
using IMS.Application.Managers.Warehouses;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GrnController : ControllerBase
    {
        private readonly IGrnManager _manager;

        public GrnController(IGrnManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _manager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGrnDto dto)
        {
            var created = await _manager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPost("receive/{id}")]
        public async Task<IActionResult> Receive(Guid id)
        {
            var ok = await _manager.ReceiveAsync(id);
            if (!ok) return BadRequest();
            return NoContent();
        }
    }
}
