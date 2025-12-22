using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Security
{
    public class RolePermissionManager : IRolePermissionManager
    {
        private readonly IRolePermissionService _service;

        public RolePermissionManager(IRolePermissionService service)
        {
            _service = service;
        }

        public Task<IEnumerable<RolePermissionDto>> GetAllAsync() => _service.GetAllAsync();

        public Task<IEnumerable<PermissionDto>> GetPermissionsForRoleAsync(Guid roleId) => _service.GetPermissionsForRoleAsync(roleId);

        public Task<bool> AssignPermissionAsync(AssignPermissionDto dto) => _service.AssignPermissionAsync(dto);

        public Task<bool> RemovePermissionAsync(AssignPermissionDto dto) => _service.RemovePermissionAsync(dto);
    }
}
