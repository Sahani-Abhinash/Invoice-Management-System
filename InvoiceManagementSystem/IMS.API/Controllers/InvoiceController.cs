using IMS.Application.DTOs.Invoicing;
using IMS.Application.Managers.Invoicing;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceManager _manager;

        public InvoiceController(IInvoiceManager manager)
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
        public async Task<IActionResult> Create([FromBody] CreateInvoiceDto dto)
        {
            var created = await _manager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateInvoiceDto dto)
        {
            var updated = await _manager.UpdateAsync(id, dto);
            if (updated == null) return BadRequest("Could not update invoice.");
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _manager.DeleteAsync(id);
            if (!deleted) return BadRequest("Could not delete invoice.");
            return NoContent();
        }

        [HttpPost("pay/{id}")]
        public async Task<IActionResult> MarkAsPaid(Guid id)
        {
            var ok = await _manager.MarkAsPaidAsync(id);
            if (!ok) return BadRequest("Could not mark invoice as paid.");
            return NoContent();
        }

        [HttpPost("{id}/payment")]
        public async Task<IActionResult> RecordPayment(Guid id, [FromBody] RecordPaymentDto dto)
        {
            try
            {
                var payment = await _manager.RecordPaymentAsync(id, dto);
                return Ok(payment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("{id}/payment-details")]
        public async Task<IActionResult> GetPaymentDetails(Guid id)
        {
            try
            {
                var details = await _manager.GetPaymentDetailsAsync(id);
                return Ok(details);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
