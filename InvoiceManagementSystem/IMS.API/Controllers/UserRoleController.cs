using IMS.Application.DTOs.Security;
using IMS.Application.Managers.Security;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserRoleController : ControllerBase
    {
        private readonly IUserRoleManager _manager;

        public UserRoleController(IUserRoleManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _manager.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetRolesForUser(Guid userId)
        {
            var roles = await _manager.GetRolesForUserAsync(userId);
            return Ok(roles);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> Assign([FromBody] AssignRoleDto dto)
        {
            var ok = await _manager.AssignRoleAsync(dto);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpPost("remove")]
        public async Task<IActionResult> Remove([FromBody] AssignRoleDto dto)
        {
            var ok = await _manager.RemoveRoleAsync(dto);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
