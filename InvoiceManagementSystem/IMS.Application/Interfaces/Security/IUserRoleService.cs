using IMS.Application.DTOs.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Security
{
    public interface IUserRoleService
    {
        Task<IEnumerable<UserRoleDto>> GetAllAsync();
        Task<IEnumerable<RoleDto>> GetRolesForUserAsync(Guid userId);
        Task<bool> AssignRoleAsync(AssignRoleDto dto);
        Task<bool> RemoveRoleAsync(AssignRoleDto dto);
    }
}
