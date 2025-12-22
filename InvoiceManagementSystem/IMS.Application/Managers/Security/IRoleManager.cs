using IMS.Application.DTOs.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Security
{
    public interface IRoleManager
    {
        Task<IEnumerable<RoleDto>> GetAllAsync();
        Task<RoleDto?> GetByIdAsync(Guid id);
        Task<RoleDto> CreateAsync(CreateRoleDto dto);
        Task<RoleDto?> UpdateAsync(Guid id, CreateRoleDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
