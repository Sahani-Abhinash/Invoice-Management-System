using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Product
{
    public class ItemDetailsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public UnitOfMeasureDto UnitOfMeasure { get; set; } = null!;
        public IEnumerable<ItemImageDto> Images { get; set; } = Array.Empty<ItemImageDto>();
        public IEnumerable<ItemPriceDto> Prices { get; set; } = Array.Empty<ItemPriceDto>();
    }
}
