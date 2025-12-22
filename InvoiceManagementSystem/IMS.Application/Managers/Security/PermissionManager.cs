using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Security
{
    public class PermissionManager : IPermissionManager
    {
        private readonly IPermissionService _permissionService;

        public PermissionManager(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        public async Task<IEnumerable<PermissionDto>> GetAllAsync() => await _permissionService.GetAllAsync();

        public async Task<PermissionDto?> GetByIdAsync(Guid id) => await _permissionService.GetByIdAsync(id);

        public async Task<PermissionDto> CreateAsync(CreatePermissionDto dto) => await _permissionService.CreateAsync(dto);

        public async Task<PermissionDto?> UpdateAsync(Guid id, CreatePermissionDto dto) => await _permissionService.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _permissionService.DeleteAsync(id);
    }
}
