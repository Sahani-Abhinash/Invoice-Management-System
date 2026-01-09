using IMS.Domain.Common;
using System;

namespace IMS.Domain.Entities.Product
{
    /// <summary>
    /// Represents a variant combination for an ItemPrice.
    /// Example: For a T-shirt ItemPrice, variants could be:
    /// - Color: Red, Size: S (with specific price)
    /// - Color: Red, Size: M (with specific price)
    /// - Color: Blue, Size: L (with specific price)
    /// </summary>
    public class ItemPriceVariant : BaseEntity
    {
        /// <summary>
        /// Foreign key to ItemPrice
        /// Each variant belongs to a specific ItemPrice
        /// </summary>
        public Guid ItemPriceId { get; set; }
        public ItemPrice ItemPrice { get; set; } = null!;

        /// <summary>
        /// Foreign key to PropertyAttribute
        /// This represents a specific variant value (e.g., "Red", "Size M", "White")
        /// </summary>
        public Guid PropertyAttributeId { get; set; }
        public PropertyAttribute PropertyAttribute { get; set; } = null!;

        /// <summary>
        /// Display order for sorting variants (e.g., Red before Blue)
        /// </summary>
        public int DisplayOrder { get; set; } = 0;

        /// <summary>
        /// Optional: Stock quantity for this specific variant combination
        /// </summary>
        public int? StockQuantity { get; set; }

        /// <summary>
        /// Optional: SKU suffix for this variant (e.g., "WHITE-M" appended to base SKU)
        /// </summary>
        public string? VariantSKU { get; set; }
    }
}
