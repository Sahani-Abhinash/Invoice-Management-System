using IMS.Application.DTOs.Warehouses;
using IMS.Application.Managers.Warehouses;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly IPurchaseOrderManager _manager;

        public PurchaseOrderController(IPurchaseOrderManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _manager.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id) { var r = await _manager.GetByIdAsync(id); if (r==null) return NotFound(); return Ok(r);} 

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderDto dto) { var created = await _manager.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = created.Id }, created); }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreatePurchaseOrderDto dto) { var updated = await _manager.UpdateAsync(id, dto); if (updated == null) return BadRequest("Could not update. PO might be approved, closed or not found."); return Ok(updated); }

        [HttpPost("approve/{id}")]
        public async Task<IActionResult> Approve(Guid id) { var r = await _manager.ApproveAsync(id); if (r==null) return NotFound(); return Ok(r);} 

        [HttpPost("close/{id}")]
        public async Task<IActionResult> Close(Guid id) { var ok = await _manager.CloseAsync(id); if (!ok) return NotFound(); return NoContent(); }
    }
}
