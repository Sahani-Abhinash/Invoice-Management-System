using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Product
{
    public class ItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public UnitOfMeasureDto? UnitOfMeasure { get; set; }
        public List<ItemImageDto> Images { get; set; } = new();
        public string MainImageUrl { get; set; } = string.Empty;
    }
}
