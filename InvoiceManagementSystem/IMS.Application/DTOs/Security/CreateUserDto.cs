using IMS.Domain.Enums;
using System;

namespace IMS.Application.DTOs.Security
{
    public class CreateUserDto
    {
        /// <summary>
        /// User first name.
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// User last name.
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// User email (used for login).
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Plain text password (should be hashed by service before storing).
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// User mobile number.
        /// </summary>
        public string Mobile { get; set; } = string.Empty;

        /// <summary>
        /// User gender (optional text value).
        /// </summary>
        public string Gender { get; set; } = string.Empty;

        /// <summary>
        /// Profile picture URL (set by server after upload).
        /// </summary>
        public string? ProfilePictureUrl { get; set; }

        /// <summary>
        /// Account status.
        /// </summary>
        public UserStatus Status { get; set; } = UserStatus.Active;
    }
}
