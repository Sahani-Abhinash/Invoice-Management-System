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
        private readonly AppDbContext _context;

        public RolePermissionService(
            IRepository<RolePermission> rpRepo,
            IRepository<Role> roleRepo,
            IRepository<Permission> permRepo,
            AppDbContext context)
        {
            _rpRepo = rpRepo;
            _roleRepo = roleRepo;
            _permRepo = permRepo;
            _context = context;
        }

        public async Task<IEnumerable<RolePermissionDto>> GetAllAsync()
        {
            var list = await _context.RolePermissions.ToListAsync();
            return list.Select(rp => new RolePermissionDto { RoleId = rp.RoleId, PermissionId = rp.PermissionId });
        }

        public async Task<IEnumerable<PermissionDto>> GetPermissionsForRoleAsync(Guid roleId)
        {
            var perms = await _context.RolePermissions
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

            var exists = await _context.RolePermissions.AnyAsync(x => x.RoleId == dto.RoleId && x.PermissionId == dto.PermissionId);
            if (exists) return true;

            await _context.RolePermissions.AddAsync(new RolePermission { RoleId = dto.RoleId, PermissionId = dto.PermissionId });
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemovePermissionAsync(AssignPermissionDto dto)
        {
            var rp = await _context.RolePermissions.FirstOrDefaultAsync(x => x.RoleId == dto.RoleId && x.PermissionId == dto.PermissionId);
            if (rp == null) return false;
            _context.RolePermissions.Remove(rp);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
