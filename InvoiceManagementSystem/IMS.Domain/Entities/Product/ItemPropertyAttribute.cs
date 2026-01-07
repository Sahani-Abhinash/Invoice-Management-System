using IMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Product
{
    public class ItemPropertyAttribute : BaseEntity
    {
        /// <summary>
        /// Reference to the Item
        /// </summary>
        public Guid ItemId { get; set; }
        public Item Item { get; set; } = null!;

        /// <summary>
        /// Reference to the PropertyAttribute (the specific value like Red, Small, etc.)
        /// </summary>
        public Guid PropertyAttributeId { get; set; }
        public PropertyAttribute PropertyAttribute { get; set; } = null!;

        /// <summary>
        /// Optional: Additional metadata or notes about this assignment
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// Display order for sorting attributes on the item
        /// </summary>
        public int DisplayOrder { get; set; } = 0;
    }
}
