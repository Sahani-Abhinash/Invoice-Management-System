using System;

namespace IMS.Application.DTOs.Product
{
    public class CreateItemPriceDto
    {
        public Guid ItemId { get; set; }
        public Guid PriceListId { get; set; }
        public decimal Price { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}
