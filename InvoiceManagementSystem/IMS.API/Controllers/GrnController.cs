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

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateGrnDto dto)
        {
            var updated = await _manager.UpdateAsync(id, dto);
            if (updated == null) return BadRequest("Could not update. GRN might be received or not found.");
            return Ok(updated);
        }

        [HttpPost("receive/{id}")]
        public async Task<IActionResult> Receive(Guid id)
        {
            var ok = await _manager.ReceiveAsync(id);
            if (!ok) return BadRequest();
            return NoContent();
        }

        [HttpPost("{id}/payment")]
        public async Task<IActionResult> RecordPayment(Guid id, [FromBody] RecordGrnPaymentDto dto)
        {
            try
            {
                var payment = await _manager.RecordPaymentAsync(id, dto);
                return Ok(payment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"GRN with ID {id} not found");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}/payment-details")]
        public async Task<IActionResult> GetPaymentDetails(Guid id)
        {
            var details = await _manager.GetPaymentDetailsAsync(id);
            if (details == null) return NotFound();
            return Ok(details);
        }
    }
}
