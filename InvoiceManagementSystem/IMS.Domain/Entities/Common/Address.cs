using IMS.Domain.Common;
using System;

namespace IMS.Domain.Entities.Common
{
    public class Address : BaseEntity
    {
        public string Line1 { get; set; } = string.Empty;
        public string? Line2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string? State { get; set; }
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        // Optional type: Billing, Shipping, HeadOffice, etc.
        public IMS.Domain.Enums.AddressType Type { get; set; } = IMS.Domain.Enums.AddressType.Other;
    }
}
