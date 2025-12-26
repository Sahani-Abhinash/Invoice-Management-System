using System;

namespace IMS.Application.DTOs.Geography
{
    public class StateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid CountryId { get; set; }
        public CountryDto? Country { get; set; }
    }
}