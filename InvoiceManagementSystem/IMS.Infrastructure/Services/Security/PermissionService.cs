using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Security;
using IMS.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Security
{
    public class PermissionService : IPermissionService
    {
        private readonly IRepository<Permission> _repository;

        public PermissionService(IRepository<Permission> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<PermissionDto>> GetAllAsync()
        {
            var perms = await _repository.GetAllAsync();

            return perms.Select(p => new PermissionDto { Id = p.Id, Name = p.Name }).ToList();
        }

        public async Task<PermissionDto?> GetByIdAsync(Guid id)
        {
            var p = await _repository.GetByIdAsync(id);
            if (p == null) return null;
            return new PermissionDto { Id = p.Id, Name = p.Name };
        }

        public async Task<PermissionDto> CreateAsync(CreatePermissionDto dto)
        {
            var p = new Permission { Id = Guid.NewGuid(), Name = dto.Name };
            await _repository.AddAsync(p);
            await _repository.SaveChangesAsync();
            return new PermissionDto { Id = p.Id, Name = p.Name };
        }

        public async Task<PermissionDto?> UpdateAsync(Guid id, CreatePermissionDto dto)
        {
            var p = await _repository.GetByIdAsync(id);
            if (p == null) return null;
            p.Name = dto.Name;
            _repository.Update(p);
            await _repository.SaveChangesAsync();
            return new PermissionDto { Id = p.Id, Name = p.Name };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var p = await _repository.GetByIdAsync(id);
            if (p == null) return false;
            _repository.Delete(p);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
