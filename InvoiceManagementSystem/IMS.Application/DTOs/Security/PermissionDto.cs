using System;

namespace IMS.Application.DTOs.Security
{
    /// <summary>
    /// DTO representing a permission (used in role/permission APIs).
    /// </summary>
    public class PermissionDto
    {
        /// <summary>
        /// Permission identifier.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Permission name (e.g. "Users.Manage").
        /// </summary>
        public string Name { get; set; } = string.Empty;
    }
}
