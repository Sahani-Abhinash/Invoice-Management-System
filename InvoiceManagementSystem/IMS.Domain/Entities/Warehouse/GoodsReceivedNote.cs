using IMS.Domain.Common;
using System;
using System.Collections.Generic;

namespace IMS.Domain.Entities.Warehouse
{
    public class GoodsReceivedNote : BaseEntity
    {
        public Guid VendorId { get; set; }
        public Guid WarehouseId { get; set; }
        // Optional link to originating purchase order
        public Guid? PurchaseOrderId { get; set; }
        public DateTime ReceivedDate { get; set; }
        public string Reference { get; set; } = string.Empty;
        public bool IsReceived { get; set; }

        public ICollection<GoodsReceivedNoteLine> Lines { get; set; } = new List<GoodsReceivedNoteLine>();
    }
}
