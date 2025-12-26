using IMS.Domain.Common;
using System;

namespace IMS.Domain.Entities.Companies
{
    public class Vendor : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
    }
}
