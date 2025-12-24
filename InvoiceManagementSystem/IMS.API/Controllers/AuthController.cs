using IMS.Application.Interfaces;
using IMS.Application.Interfaces.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace IMS.API.Controllers
{    
    /// <summary>
    /// Authentication endpoints (login and permission checks).
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        /// <summary>
        /// Repository for user entities.
        /// </summary>
        private readonly IRepository<IMS.Domain.Entities.Security.User> _userRepo;

        /// <summary>
        /// Repository for user-role relationships.
        /// </summary>
        private readonly IRepository<IMS.Domain.Entities.Security.UserRole> _userRoleRepo;

        /// <summary>
        /// Password hashing helper.
        /// </summary>
        private readonly IPasswordHasher _hasher;

        /// <summary>
        /// JWT token generator.
        /// </summary>
        private readonly IJwtTokenService _jwt;

        public AuthController(
            IRepository<IMS.Domain.Entities.Security.User> userRepo,
            IRepository<IMS.Domain.Entities.Security.UserRole> userRoleRepo,
            IPasswordHasher hasher,
            IJwtTokenService jwt)
        {
            _userRepo = userRepo;
            _userRoleRepo = userRoleRepo;
            _hasher = hasher;
            _jwt = jwt;
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token and permissions.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _userRepo.GetQueryable()
                .Where(u => u.Email == request.Email)
                .Include(u => u.UserRoles!)
                    .ThenInclude(ur => ur.Role!)
                        .ThenInclude(r => r.RolePermissions!)
                            .ThenInclude(rp => rp.Permission!)
                .FirstOrDefaultAsync();

            if (user == null || !_hasher.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            var permissions = user.UserRoles
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToList();

            var token = _jwt.GenerateToken(user, permissions);

            return Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    fullName = $"{user.FirstName} {user.LastName}".Trim()
                },
                permissions // Return permissions array ["Users.Manage", "Roles.View", etc.]
            });
        }

        /// <summary>
        /// Returns permissions for the current authenticated user.
        /// </summary>
        [HttpGet("me/permissions")]
        [Authorize]
        public async Task<IActionResult> GetMyPermissions()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var permissions = await _userRoleRepo.GetQueryable()
                .Where(ur => ur.UserId == userId)
                .Include(ur => ur.Role!)
                    .ThenInclude(r => r.RolePermissions!)
                        .ThenInclude(rp => rp.Permission!)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => new
                {
                    rp.Permission.Id,
                    rp.Permission.Name
                })
                .Distinct()
                .ToListAsync();

            return Ok(permissions);
        }

        /// <summary>
        /// Check whether the current user has a specific permission by name.
        /// </summary>
        [HttpGet("me/permissions/check")]
        [Authorize]
        public async Task<IActionResult> CheckPermission([FromQuery] string name)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var hasPermission = await _userRoleRepo.GetQueryable()
                .Where(ur => ur.UserId == userId)
                .Include(ur => ur.Role!)
                    .ThenInclude(r => r.RolePermissions!)
                        .ThenInclude(rp => rp.Permission!)
                .SelectMany(ur => ur.Role.RolePermissions)
                .AnyAsync(rp => rp.Permission.Name == name);

            return Ok(new { hasPermission });
        }
    }
}