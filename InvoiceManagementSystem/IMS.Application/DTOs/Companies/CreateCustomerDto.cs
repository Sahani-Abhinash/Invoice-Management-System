using System;

namespace IMS.Application.DTOs.Companies
{
    public class CreateCustomerDto
    {
        public string Name { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public Guid? BranchId { get; set; }
    }
}
