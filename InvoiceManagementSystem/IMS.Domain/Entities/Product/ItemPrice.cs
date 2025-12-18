using IMS.Domain.Common;
using IMS.Domain.Entities.Pricing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Product
{
    public class ItemPrice : BaseEntity
    {
        public Guid ItemId { get; set; }
        public Item Item { get; set; } = null!;

        public Guid PriceListId { get; set; }
        public PriceList PriceList { get; set; } = null!;

        public decimal Price { get; set; }

        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }

}
