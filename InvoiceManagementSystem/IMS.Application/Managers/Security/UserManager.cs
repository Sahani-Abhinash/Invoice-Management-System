using IMS.Application.DTOs.Security;
using IMS.Application.Interfaces.Security;
using IMS.Application.Managers.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Security
{
    public class UserManager : IUserManager
    {
        private readonly IUserService _userService;

        public UserManager(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync() => await _userService.GetAllAsync();

        public async Task<UserDto?> GetByIdAsync(Guid id) => await _userService.GetByIdAsync(id);

        public async Task<UserDto> CreateAsync(CreateUserDto dto) => await _userService.CreateAsync(dto);

        public async Task<UserDto?> UpdateAsync(Guid id, CreateUserDto dto) => await _userService.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _userService.DeleteAsync(id);
    }
}
