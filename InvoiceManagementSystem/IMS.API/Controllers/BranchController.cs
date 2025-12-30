using IMS.Application.DTOs.Companies;
using IMS.Application.Managers.Companies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    /// <summary>
    /// Controller for managing branches (CRUD operations).
    /// </summary>
    public class BranchController : ControllerBase
    {
        private readonly IBranchManager _branchManager;

        public BranchController(IBranchManager branchManager)
        {
            _branchManager = branchManager;
        }

        /// <summary>
        /// Get all branches.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Retrieve all branch DTOs
            var branches = await _branchManager.GetAllAsync();
            return Ok(branches);
        }

        /// <summary>
        /// Get a branch by its id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            // Find branch by id
            var branch = await _branchManager.GetByIdAsync(id);
            if (branch == null) return NotFound();
            return Ok(branch);
        }

        // Company-scoped branch retrieval removed; use GET /api/branch and client-side filtering.

        /// <summary>
        /// Create a new branch.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBranchDto dto)
        {
            // Create and return created resource
            var branch = await _branchManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = branch.Id }, branch);
        }

        /// <summary>
        /// Update an existing branch.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateBranchDto dto)
        {
            var updated = await _branchManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete a branch (soft-delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _branchManager.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
