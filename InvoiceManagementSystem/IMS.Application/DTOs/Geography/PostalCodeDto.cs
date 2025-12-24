using System;

namespace IMS.Application.DTOs.Geography
{
    public class PostalCodeDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public CityDto? City { get; set; }
    }
}