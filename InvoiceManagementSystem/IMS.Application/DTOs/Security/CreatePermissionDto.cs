using System;

namespace IMS.Application.DTOs.Security
{
    /// <summary>
    /// DTO used when creating a new permission.
    /// </summary>
    public class CreatePermissionDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
