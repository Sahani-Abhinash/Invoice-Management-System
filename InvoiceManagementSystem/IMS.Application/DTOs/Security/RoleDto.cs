using System;

namespace IMS.Application.DTOs.Security
{
    public class RoleDto
    {
        /// <summary>
        /// Role identifier.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Role display name.
        /// </summary>
        public string Name { get; set; } = string.Empty;
    }
}
