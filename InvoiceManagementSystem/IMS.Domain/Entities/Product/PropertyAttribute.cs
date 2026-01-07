using IMS.Domain.Common;
using System;
using System.Collections.Generic;

namespace IMS.Domain.Entities.Product
{
    /// <summary>
    /// Represents a specific attribute value for a property (e.g., Color: Red, Size: Large)
    /// </summary>
    public class PropertyAttribute : BaseEntity
    {
        public Guid ProductPropertyId { get; set; }
        public ProductProperty ProductProperty { get; set; } = null!;

        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; } = 0;

        // Optional: Additional metadata like color codes, etc.
        public string? Metadata { get; set; }

        public ICollection<ItemPropertyAttribute> ItemPropertyAttributes { get; set; } = new List<ItemPropertyAttribute>();
    }
}
