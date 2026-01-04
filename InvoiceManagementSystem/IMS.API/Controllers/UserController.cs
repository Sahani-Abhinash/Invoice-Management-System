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

        /// <summary>
        /// Uploads a user profile picture (replaces existing picture if present).
        /// </summary>
        /// <param name="id">User identifier.</param>
        /// <returns>200 OK with profile picture URL or error response.</returns>
        [HttpPost("{id}/upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(Guid id, IFormFile file)
        {
            // Validate file
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Check file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("File size exceeds 5MB limit");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Invalid file type. Allowed: JPG, PNG, GIF");

            try
            {
                // Get user
                var user = await _userManager.GetByIdAsync(id);
                if (user == null)
                    return NotFound("User not found");

                // Create uploads directory if it doesn't exist
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profile-pictures");
                Directory.CreateDirectory(uploadsDir);

                // Delete old profile picture if it exists
                if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
                {
                    // Extract filename from URL and delete file
                    var oldFileName = Path.GetFileName(user.ProfilePictureUrl);
                    var oldFilePath = Path.Combine(uploadsDir, oldFileName);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Save new file with simple naming: {userId}.{extension}
                var fileName = $"{id}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Build URL
                var pictureUrl = $"/uploads/profile-pictures/{fileName}";

                // Update user with profile picture URL
                var updateDto = new CreateUserDto
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Password = string.Empty, // Don't change password on picture upload
                    Mobile = user.Mobile ?? string.Empty,
                    Gender = user.Gender ?? string.Empty,
                    ProfilePictureUrl = pictureUrl,
                    Status = user.Status
                };

                var updated = await _userManager.UpdateAsync(id, updateDto);
                if (updated == null)
                    return BadRequest("Failed to update user profile picture");

                return Ok(new { profilePictureUrl = pictureUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
