using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Product
{
    /// <summary>
    /// DTO for displaying an item with its prices across available price lists
    /// Used when selecting items for invoice creation to show different prices
    /// </summary>
    public class ItemWithPricesDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public UnitOfMeasureDto? UnitOfMeasure { get; set; }
        
        /// <summary>
        /// Dictionary of PriceList Name -> Price
        /// Example: { "Retail": 100, "Wholesale": 90 }
        /// </summary>
        public Dictionary<string, decimal> Prices { get; set; } = new();
    }

    /// <summary>
    /// DTO for showing a single item's price for a specific price list
    /// </summary>
    public class ItemPriceForListDto
    {
        public Guid ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string ItemSKU { get; set; } = string.Empty;
        public Guid PriceListId { get; set; }
        public string PriceListName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}
