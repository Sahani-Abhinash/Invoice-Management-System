using System;

namespace IMS.Application.DTOs.Geography
{
    public class PostalCodeDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public Guid CityId { get; set; }
        public CityDto? City { get; set; }
    }
}