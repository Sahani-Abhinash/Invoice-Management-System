using IMS.Application.DTOs.Security;
using IMS.Application.Managers.Security;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolePermissionController : ControllerBase
    {
        /// <summary>
        /// Manager that handles role-permission assignments.
        /// </summary>
        private readonly IRolePermissionManager _manager;

        /// <summary>
        /// Create RolePermissionController.
        /// </summary>
        public RolePermissionController(IRolePermissionManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _manager.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("role/{roleId}")]
        public async Task<IActionResult> GetPermissionsForRole(Guid roleId)
        {
            var perms = await _manager.GetPermissionsForRoleAsync(roleId);
            return Ok(perms);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> Assign([FromBody] AssignPermissionDto dto)
        {
            var ok = await _manager.AssignPermissionAsync(dto);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpPost("remove")]
        public async Task<IActionResult> Remove([FromBody] AssignPermissionDto dto)
        {
            var ok = await _manager.RemovePermissionAsync(dto);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
