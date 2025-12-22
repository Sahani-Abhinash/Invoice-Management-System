using IMS.Application.DTOs.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Security
{
    public interface IRolePermissionService
    {
        Task<IEnumerable<RolePermissionDto>> GetAllAsync();
        Task<IEnumerable<PermissionDto>> GetPermissionsForRoleAsync(Guid roleId);
        Task<bool> AssignPermissionAsync(AssignPermissionDto dto);
        Task<bool> RemovePermissionAsync(AssignPermissionDto dto);
    }
}
