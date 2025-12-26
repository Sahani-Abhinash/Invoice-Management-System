using System;

namespace IMS.Application.DTOs.Common
{
    public class AddressDto
    {
        public Guid Id { get; set; }
        public string Line1 { get; set; } = string.Empty;
        public string? Line2 { get; set; }
        // Structured geography references
        public Guid? CountryId { get; set; }
        public IMS.Application.DTOs.Geography.CountryDto? Country { get; set; }
        public Guid? StateId { get; set; }
        public IMS.Application.DTOs.Geography.StateDto? State { get; set; }
        public Guid? CityId { get; set; }
        public IMS.Application.DTOs.Geography.CityDto? City { get; set; }
        public Guid? PostalCodeId { get; set; }
        public IMS.Application.DTOs.Geography.PostalCodeDto? PostalCode { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public IMS.Domain.Enums.AddressType? Type { get; set; }
    }
}
