using System;

namespace IMS.Application.DTOs.Common
{
    public class CreateAddressDto
    {
        public string Line1 { get; set; } = string.Empty;
        public string? Line2 { get; set; }
        // Structured references via IDs (optional)
        public Guid? CountryId { get; set; }
        public Guid? StateId { get; set; }
        public Guid? CityId { get; set; }
        public Guid? PostalCodeId { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public IMS.Domain.Enums.AddressType? Type { get; set; }
    }
}
