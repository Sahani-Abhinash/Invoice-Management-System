using IMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Product
{
    public class ItemImage : BaseEntity
    {
        public Guid ItemId { get; set; }
        public Item Item { get; set; } = null!;

        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMain { get; set; }
    }
}
