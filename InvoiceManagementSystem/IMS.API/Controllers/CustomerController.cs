using IMS.Application.DTOs.Companies;
using IMS.Application.Managers.Companies;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerManager _customerManager;

        public CustomerController(ICustomerManager customerManager)
        {
            _customerManager = customerManager;
        }

        /// <summary>
        /// Get all customers.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _customerManager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get customer by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _customerManager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get customers for a branch.
        /// </summary>
        [HttpGet("branch/{branchId}")]
        public async Task<IActionResult> GetByBranchId(Guid branchId)
        {
            var result = await _customerManager.GetByBranchIdAsync(branchId);
            return Ok(result);
        }

        /// <summary>
        /// Create a customer.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
        {
            var created = await _customerManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Update a customer.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateCustomerDto dto)
        {
            var updated = await _customerManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete a customer (soft-delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _customerManager.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
