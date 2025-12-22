using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Security;
using IMS.Domain.Entities.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Security
{
    public class UserService : IUserService
    {
        private readonly IRepository<User> _repository;
        private readonly IPasswordHasher _hasher;

        public UserService(IRepository<User> repository, IPasswordHasher hasher)
        {
            _repository = repository;
            _hasher = hasher;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var users = await _repository.GetAllAsync();
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Status = u.Status
            }).ToList();
        }

        public async Task<UserDto?> GetByIdAsync(Guid id)
        {
            var u = await _repository.GetByIdAsync(id);
            if (u == null) return null;
            return new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Status = u.Status
            };
        }

        public async Task<UserDto> CreateAsync(CreateUserDto dto)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                // keep First/Last
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = _hasher.Hash(dto.Password),
                Status = dto.Status
            };

            await _repository.AddAsync(user);
            await _repository.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Status = user.Status
            };
        }

        public async Task<UserDto?> UpdateAsync(Guid id, CreateUserDto dto)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null) return null;

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Email = dto.Email;
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.PasswordHash = _hasher.Hash(dto.Password);
            }
            user.Status = dto.Status;

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Status = user.Status
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null) return false;
            _repository.Delete(user);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
