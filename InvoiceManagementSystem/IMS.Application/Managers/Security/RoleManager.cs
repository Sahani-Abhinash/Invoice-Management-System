using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Security
{
    public class RoleManager : IRoleManager
    {
        private readonly IRoleService _roleService;

        public RoleManager(IRoleService roleService)
        {
            _roleService = roleService;
        }

        public async Task<IEnumerable<RoleDto>> GetAllAsync() => await _roleService.GetAllAsync();

        public async Task<RoleDto?> GetByIdAsync(Guid id) => await _roleService.GetByIdAsync(id);

        public async Task<RoleDto> CreateAsync(CreateRoleDto dto) => await _roleService.CreateAsync(dto);

        public async Task<RoleDto?> UpdateAsync(Guid id, CreateRoleDto dto) => await _roleService.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _roleService.DeleteAsync(id);
    }
}
