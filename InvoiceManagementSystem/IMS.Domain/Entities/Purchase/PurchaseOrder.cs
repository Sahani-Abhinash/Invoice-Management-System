using IMS.Domain.Common;
using System;
using System.Collections.Generic;

namespace IMS.Domain.Entities.Purchase
{
    public class PurchaseOrder : BaseEntity
    {
        public Guid VendorId { get; set; }
        public Guid WarehouseId { get; set; }
        public DateTime OrderDate { get; set; }
        public string Reference { get; set; } = string.Empty;
        public bool IsApproved { get; set; }
        public bool IsClosed { get; set; }

        public ICollection<PurchaseOrderLine> Lines { get; set; } = new List<PurchaseOrderLine>();
    }
}
