using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Security
{
    public class UserRoleManager : IUserRoleManager
    {
        private readonly IUserRoleService _service;

        public UserRoleManager(IUserRoleService service)
        {
            _service = service;
        }

        public Task<IEnumerable<UserRoleDto>> GetAllAsync() => _service.GetAllAsync();

        public Task<IEnumerable<RoleDto>> GetRolesForUserAsync(Guid userId) => _service.GetRolesForUserAsync(userId);

        public Task<bool> AssignRoleAsync(AssignRoleDto dto) => _service.AssignRoleAsync(dto);

        public Task<bool> RemoveRoleAsync(AssignRoleDto dto) => _service.RemoveRoleAsync(dto);
    }
}
