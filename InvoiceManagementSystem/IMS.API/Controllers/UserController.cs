using IMS.Application.DTOs.Security;
using IMS.Application.Managers.Security;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    /// <summary>
    /// Controller for managing users (CRUD).
    /// Routes use api/users.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        /// <summary>
        /// User manager used to perform user-related operations.
        /// </summary>
        private readonly IUserManager _userManager;

        /// <summary>
        /// Creates a new instance of <see cref="UsersController"/>.
        /// </summary>
        /// <param name="userManager">Injected user manager.</param>
        public UsersController(IUserManager userManager)
        {
            _userManager = userManager;
        }

        /// <summary>
        /// Retrieves all users.
        /// </summary>
        /// <returns>200 OK with a list of users.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userManager.GetAllAsync();
            return Ok(users);
        }

        /// <summary>
        /// Retrieves a user by identifier.
        /// </summary>
        /// <param name="id">User identifier.</param>
        /// <returns>200 OK with the user or 404 if not found.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userManager.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        /// <summary>
        /// Creates a new user.
        /// </summary>
        /// <param name="dto">Create user DTO.</param>
        /// <returns>201 Created with created user.</returns>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            var user = await _userManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        /// <summary>
        /// Updates an existing user.
        /// </summary>
        /// <param name="id">User identifier.</param>
        /// <param name="dto">Updated user information.</param>
        /// <returns>200 OK with updated user or 404 if not found.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateUserDto dto)
        {
            var updated = await _userManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Deletes (soft-delete) a user by id.
        /// </summary>
        /// <param name="id">User identifier.</param>
        /// <returns>204 NoContent on success or 404 if not found.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _userManager.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
