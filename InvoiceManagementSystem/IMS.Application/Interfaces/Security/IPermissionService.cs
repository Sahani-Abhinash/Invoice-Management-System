using IMS.Application.DTOs.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Security
{
    public interface IPermissionService
    {
        Task<IEnumerable<PermissionDto>> GetAllAsync();
        Task<PermissionDto?> GetByIdAsync(Guid id);
        Task<PermissionDto> CreateAsync(CreatePermissionDto dto);
        Task<PermissionDto?> UpdateAsync(Guid id, CreatePermissionDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
