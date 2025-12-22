using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Security;
using IMS.Domain.Entities.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Security
{
    public class RoleService : IRoleService
    {
        private readonly IRepository<Role> _repository;

        public RoleService(IRepository<Role> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<RoleDto>> GetAllAsync()
        {
            var roles = await _repository.GetAllAsync();
            return roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name
            }).ToList();
        }

        public async Task<RoleDto?> GetByIdAsync(Guid id)
        {
            var r = await _repository.GetByIdAsync(id);
            if (r == null) return null;
            return new RoleDto { Id = r.Id, Name = r.Name };
        }

        public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
        {
            var role = new Role { Id = Guid.NewGuid(), Name = dto.Name };
            await _repository.AddAsync(role);
            await _repository.SaveChangesAsync();
            return new RoleDto { Id = role.Id, Name = role.Name };
        }

        public async Task<RoleDto?> UpdateAsync(Guid id, CreateRoleDto dto)
        {
            var role = await _repository.GetByIdAsync(id);
            if (role == null) return null;
            role.Name = dto.Name;
            _repository.Update(role);
            await _repository.SaveChangesAsync();
            return new RoleDto { Id = role.Id, Name = role.Name };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var role = await _repository.GetByIdAsync(id);
            if (role == null) return false;
            _repository.Delete(role);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
