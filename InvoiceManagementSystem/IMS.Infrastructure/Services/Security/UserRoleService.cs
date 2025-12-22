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
    public class UserRoleService : IUserRoleService
    {
        private readonly IRepository<UserRole> _userRoleRepo;
        private readonly IRepository<Role> _roleRepo;
        private readonly IRepository<User> _userRepo;
        private readonly AppDbContext _context;

        public UserRoleService(
            IRepository<UserRole> userRoleRepo,
            IRepository<Role> roleRepo,
            IRepository<User> userRepo,
            AppDbContext context)
        {
            _userRoleRepo = userRoleRepo;
            _roleRepo = roleRepo;
            _userRepo = userRepo;
            _context = context;
        }

        public async Task<IEnumerable<UserRoleDto>> GetAllAsync()
        {
            var list = await _context.UserRoles.ToListAsync();
            return list.Select(ur => new UserRoleDto { UserId = ur.UserId, RoleId = ur.RoleId });
        }

        public async Task<IEnumerable<RoleDto>> GetRolesForUserAsync(Guid userId)
        {
            var roles = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Include(ur => ur.Role)
                .Select(ur => new RoleDto { Id = ur.Role.Id, Name = ur.Role.Name })
                .ToListAsync();

            return roles;
        }

        public async Task<bool> AssignRoleAsync(AssignRoleDto dto)
        {
            var user = await _userRepo.GetByIdAsync(dto.UserId);
            var role = await _roleRepo.GetByIdAsync(dto.RoleId);
            if (user == null || role == null) return false;

            var exists = await _context.UserRoles.AnyAsync(ur => ur.UserId == dto.UserId && ur.RoleId == dto.RoleId);
            if (exists) return true;

            await _context.UserRoles.AddAsync(new UserRole { UserId = dto.UserId, RoleId = dto.RoleId });
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveRoleAsync(AssignRoleDto dto)
        {
            var ur = await _context.UserRoles.FirstOrDefaultAsync(x => x.UserId == dto.UserId && x.RoleId == dto.RoleId);
            if (ur == null) return false;
            _context.UserRoles.Remove(ur);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
