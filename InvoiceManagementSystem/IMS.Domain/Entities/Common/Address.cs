using IMS.Domain.Common;
using System;
using IMS.Domain.Entities.Geography;

namespace IMS.Domain.Entities.Common
{
    public class Address : BaseEntity
    {
        public string Line1 { get; set; } = string.Empty;
        public string? Line2 { get; set; }
        // Optional structured references to geography entities
        public Guid? CountryId { get; set; }
        public Country? CountryRef { get; set; }

        public Guid? StateId { get; set; }
        public State? StateRef { get; set; }

        public Guid? CityId { get; set; }
        public City? CityRef { get; set; }

        public Guid? PostalCodeId { get; set; }
        public PostalCode? PostalCodeRef { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        // Optional type: Billing, Shipping, HeadOffice, etc.
        public IMS.Domain.Enums.AddressType Type { get; set; } = IMS.Domain.Enums.AddressType.Other;
    }
}
