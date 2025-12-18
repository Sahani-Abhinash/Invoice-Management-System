using IMS.Domain.Common;
using IMS.Domain.Entities.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Warehouse
{
    public class Stock : BaseEntity
    {
        public Guid ItemId { get; set; }
        public Item Item { get; set; } = null!;

        public Guid WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; } = null!;

        public decimal Quantity { get; set; }
    }

}
