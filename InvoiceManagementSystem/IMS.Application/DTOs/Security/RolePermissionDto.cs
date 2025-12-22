using System;

namespace IMS.Application.DTOs.Security
{
    public class RolePermissionDto
    {
        public Guid RoleId { get; set; }
        public Guid PermissionId { get; set; }
    }
}
