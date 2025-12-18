using IMS.Application.DTOs.Companies;
using IMS.Application.Managers.Companies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/branches")]
    public class BranchController : ControllerBase
    {
        private readonly IBranchManager _branchManager;

        public BranchController(IBranchManager branchManager)
        {
            _branchManager = branchManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var branches = await _branchManager.GetAllAsync();
            return Ok(branches);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var branch = await _branchManager.GetByIdAsync(id);
            if (branch == null) return NotFound();
            return Ok(branch);
        }

        [HttpGet("company/{companyId}")]
        public async Task<IActionResult> GetByCompanyId(Guid companyId)
        {
            var branches = await _branchManager.GetByCompanyIdAsync(companyId);
            return Ok(branches);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBranchDto dto)
        {
            var branch = await _branchManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = branch.Id }, branch);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateBranchDto dto)
        {
            var updated = await _branchManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _branchManager.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
