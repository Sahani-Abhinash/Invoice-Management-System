using IMS.Domain.Common;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Warehouse
{
    public class StockTransaction : BaseEntity
    {
        public Guid ItemId { get; set; }
        public Guid WarehouseId { get; set; }

        public decimal Quantity { get; set; }
        public StockTransactionType TransactionType { get; set; }
        // IN, OUT, ADJUSTMENT

        public string Reference { get; set; } = string.Empty;
        // Invoice, Purchase, Manual
    }
       
}
