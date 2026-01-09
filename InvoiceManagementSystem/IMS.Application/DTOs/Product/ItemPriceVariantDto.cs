using System;

namespace IMS.Application.DTOs.Product
{
    /// <summary>
    /// DTO for retrieving ItemPriceVariant information
    /// </summary>
    public class ItemPriceVariantDto
    {
        public Guid Id { get; set; }
        public Guid ItemPriceId { get; set; }
        public Guid PropertyAttributeId { get; set; }

        /// <summary>
        /// Display information for the variant
        /// </summary>
        public string? PropertyName { get; set; }           // e.g., "Color"
        public string? AttributeValue { get; set; }        // e.g., "White"
        public string? DisplayLabel { get; set; }          // e.g., "Color: White"

        public int DisplayOrder { get; set; }
        public int? StockQuantity { get; set; }
        public string? VariantSKU { get; set; }

        /// <summary>
        /// Include price information for convenience
        /// </summary>
        public decimal? Price { get; set; }
        public string? ItemName { get; set; }
    }

    /// <summary>
    /// DTO for creating a new ItemPriceVariant
    /// </summary>
    public class CreateItemPriceVariantDto
    {
        public Guid ItemPriceId { get; set; }
        public Guid PropertyAttributeId { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public int? StockQuantity { get; set; }
        public string? VariantSKU { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing ItemPriceVariant
    /// Note: If PropertyAttributeId changes, the backend will recreate the record with the new key
    /// </summary>
    public class UpdateItemPriceVariantDto
    {
        public Guid Id { get; set; }
        public Guid ItemPriceId { get; set; }
        public Guid PropertyAttributeId { get; set; }
        public int DisplayOrder { get; set; }
        public int? StockQuantity { get; set; }
        public string? VariantSKU { get; set; }
    }
}
