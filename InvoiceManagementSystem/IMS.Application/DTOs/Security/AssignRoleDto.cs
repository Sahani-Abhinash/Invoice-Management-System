using System;

namespace IMS.Application.DTOs.Security
{
    public class AssignRoleDto
    {
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
    }
}
