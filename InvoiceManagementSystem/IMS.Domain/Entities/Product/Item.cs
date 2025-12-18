using IMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Product
{
    public class Item : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;

        public Guid UnitOfMeasureId { get; set; }
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;

        public ICollection<ItemImage> Images { get; set; } = new List<ItemImage>();
        public ICollection<ItemPrice> Prices { get; set; } = new List<ItemPrice>();
    }
}
