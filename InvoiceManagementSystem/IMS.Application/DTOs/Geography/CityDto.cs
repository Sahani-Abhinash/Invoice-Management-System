using System;

namespace IMS.Application.DTOs.Geography
{
    public class CityDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public StateDto? State { get; set; }
    }
}