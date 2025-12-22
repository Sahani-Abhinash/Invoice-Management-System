using IMS.Domain.Enums;
using System;

namespace IMS.Application.DTOs.Security
{
    public class CreateUserDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserStatus Status { get; set; } = UserStatus.Active;
    }
}
