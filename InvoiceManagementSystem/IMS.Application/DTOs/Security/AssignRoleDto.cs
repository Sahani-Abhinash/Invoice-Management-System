using System;

namespace IMS.Application.DTOs.Security
{
    /// <summary>
    /// DTO used to assign or remove a role from a user.
    /// </summary>
    public class AssignRoleDto
    {
        /// <summary>
        /// Identifier of the user to assign/remove role for.
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Identifier of the role to assign/remove.
        /// </summary>
        public Guid RoleId { get; set; }
    }
}
