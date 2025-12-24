using IMS.Application.DTOs.Security;
using IMS.Application.Managers.Security;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionController : ControllerBase
    {
        /// <summary>
        /// Permission manager used to manage permissions.
        /// </summary>
        private readonly IPermissionManager _permissionManager;

        /// <summary>
        /// Create PermissionController.
        /// </summary>
        public PermissionController(IPermissionManager permissionManager)
        {
            _permissionManager = permissionManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var perms = await _permissionManager.GetAllAsync();
            return Ok(perms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var p = await _permissionManager.GetByIdAsync(id);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePermissionDto dto)
        {
            var p = await _permissionManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = p.Id }, p);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreatePermissionDto dto)
        {
            var updated = await _permissionManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _permissionManager.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
