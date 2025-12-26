using IMS.Application.DTOs.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.DTOs.Companies
{
    public class CreateBranchDto
    {
        public Guid CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        // Optional link to an existing Address entity
        public Guid? AddressId { get; set; }
        // Plain text address fallback (used if no AddressId is provided)
        public string? Address { get; set; }
    }
}
