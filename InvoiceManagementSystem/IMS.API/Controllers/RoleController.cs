using IMS.Application.DTOs.Security;
using IMS.Application.Managers.Security;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        /// <summary>
        /// Manager handling role operations.
        /// </summary>
        private readonly IRoleManager _roleManager;

        /// <summary>
        /// Create a RoleController instance.
        /// </summary>
        public RoleController(IRoleManager roleManager)
        {
            _roleManager = roleManager;
        }

        /// <summary>
        /// Get all roles.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await _roleManager.GetAllAsync();
            return Ok(roles);
        }

        /// <summary>
        /// Get a role by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var role = await _roleManager.GetByIdAsync(id);
            if (role == null) return NotFound();
            return Ok(role);
        }

        /// <summary>
        /// Create a role.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoleDto dto)
        {
            var role = await _roleManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = role.Id }, role);
        }

        /// <summary>
        /// Update a role.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateRoleDto dto)
        {
            var updated = await _roleManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete a role (soft-delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _roleManager.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
