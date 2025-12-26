using System;

namespace IMS.Application.DTOs.Companies
{
    public class VendorDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public Guid? AddressId { get; set; }
        public IMS.Application.DTOs.Common.AddressDto? Address { get; set; }
    }

    public class CreateVendorDto
    {
        public string Name { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public Guid? AddressId { get; set; }
    }
}
