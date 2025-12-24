using IMS.Application.DTOs.Product;
using IMS.Application.DTOs.Pricing;
using System;

namespace IMS.Application.DTOs.Product
{
    public class ItemPriceDto
    {
        public Guid Id { get; set; }
        public ItemDto Item { get; set; } = null!;
        public PriceListDto PriceList { get; set; } = null!;
        public decimal Price { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}
