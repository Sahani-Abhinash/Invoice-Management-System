using IMS.Application.DTOs.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Security
{
    public interface IUserManager
    {
        /// <summary>
        /// Get all users.
        /// </summary>
        Task<IEnumerable<UserDto>> GetAllAsync();

        /// <summary>
        /// Get user by id.
        /// </summary>
        Task<UserDto?> GetByIdAsync(Guid id);

        /// <summary>
        /// Create a new user.
        /// </summary>
        Task<UserDto> CreateAsync(CreateUserDto dto);

        /// <summary>
        /// Update a user.
        /// </summary>
        Task<UserDto?> UpdateAsync(Guid id, CreateUserDto dto);

        /// <summary>
        /// Delete user by id (soft-delete).
        /// </summary>
        Task<bool> DeleteAsync(Guid id);
    }
}
