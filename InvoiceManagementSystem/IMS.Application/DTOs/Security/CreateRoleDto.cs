using System;

namespace IMS.Application.DTOs.Security
{
    /// <summary>
    /// DTO used when creating or updating a role.
    /// </summary>
    public class CreateRoleDto
    {
        /// <summary>
        /// Role display name.
        /// </summary>
        public string Name { get; set; } = string.Empty;
    }
}
