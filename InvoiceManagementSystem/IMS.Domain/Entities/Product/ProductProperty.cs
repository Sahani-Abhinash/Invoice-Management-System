using IMS.Domain.Common;
using System;
using System.Collections.Generic;

namespace IMS.Domain.Entities.Product
{
    /// <summary>
    /// Represents a product property type (e.g., Color, Size, Material, Brand)
    /// </summary>
    public class ProductProperty : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; } = 0;

        // Navigation property to attributes
        public ICollection<PropertyAttribute> Attributes { get; set; } = new List<PropertyAttribute>();
    }
}
