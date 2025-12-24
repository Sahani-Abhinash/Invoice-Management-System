using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Security;
using IMS.Domain.Entities.Security;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Security
{
    public class RolePermissionService : IRolePermissionService
    {
        private readonly IRepository<RolePermission> _rpRepo;
        private readonly IRepository<Role> _roleRepo;
        private readonly IRepository<Permission> _permRepo;

        public RolePermissionService(
            IRepository<RolePermission> rpRepo,
            IRepository<Role> roleRepo,
            IRepository<Permission> permRepo)
        {
            _rpRepo = rpRepo;
            _roleRepo = roleRepo;
            _permRepo = permRepo;
        }

        public async Task<IEnumerable<RolePermissionDto>> GetAllAsync()
        {
            var list = await _rpRepo.GetAllAsync();
            return list.Select(rp => new RolePermissionDto { RoleId = rp.RoleId, PermissionId = rp.PermissionId });
        }

        public async Task<IEnumerable<PermissionDto>> GetPermissionsForRoleAsync(Guid roleId)
        {
            var perms = await _rpRepo.GetQueryable()
                .Where(rp => rp.RoleId == roleId)
                .Include(rp => rp.Permission)
                .Select(rp => new PermissionDto { Id = rp.Permission.Id, Name = rp.Permission.Name })
                .ToListAsync();

            return perms;
        }

        public async Task<bool> AssignPermissionAsync(AssignPermissionDto dto)
        {
            var role = await _roleRepo.GetByIdAsync(dto.RoleId);
            var perm = await _permRepo.GetByIdAsync(dto.PermissionId);
            if (role == null || perm == null) return false;

            var exists = await _rpRepo.GetQueryable().AnyAsync(x => x.RoleId == dto.RoleId && x.PermissionId == dto.PermissionId);
            if (exists) return true;

            await _rpRepo.AddAsync(new RolePermission { RoleId = dto.RoleId, PermissionId = dto.PermissionId });
            await _rpRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemovePermissionAsync(AssignPermissionDto dto)
        {
            var rp = await _rpRepo.GetQueryable().FirstOrDefaultAsync(x => x.RoleId == dto.RoleId && x.PermissionId == dto.PermissionId);
            if (rp == null) return false;
            _rpRepo.Delete(rp);
            await _rpRepo.SaveChangesAsync();
            return true;
        }
    }
}
