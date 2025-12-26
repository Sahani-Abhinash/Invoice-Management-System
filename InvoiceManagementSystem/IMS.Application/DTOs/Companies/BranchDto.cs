using IMS.Application.DTOs.Companies;
using IMS.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.DTOs.Companies
{
    public class BranchDto
    {
        public Guid Id { get; set; }
        /// <summary>
        /// Branch display name.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Branch physical address.
        /// </summary>
        public Guid? AddressId { get; set; }
        public AddressDto? Address { get; set; }

        /// <summary>
        /// Parent company information.
        /// </summary>
        public CompanyDto Company { get; set; } = null!;
    }
}
