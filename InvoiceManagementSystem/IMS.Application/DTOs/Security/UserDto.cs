using IMS.Domain.Enums;
using System;

namespace IMS.Application.DTOs.Security
{
    public class UserDto
    {
        /// <summary>
        /// User identifier.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// First name.
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Last name.
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Email address.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Mobile number.
        /// </summary>
        public string Mobile { get; set; } = string.Empty;

        /// <summary>
        /// Gender (text value).
        /// </summary>
        public string Gender { get; set; } = string.Empty;

        /// <summary>
        /// Profile picture URL or data URI.
        /// </summary>
        public string ProfilePictureUrl { get; set; } = string.Empty;

        /// <summary>
        /// Account status.
        /// </summary>
        public UserStatus Status { get; set; }
    }
}
