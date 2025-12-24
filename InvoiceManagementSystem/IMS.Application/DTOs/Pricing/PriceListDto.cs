using System;

namespace IMS.Application.DTOs.Pricing
{
    public class PriceListDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
