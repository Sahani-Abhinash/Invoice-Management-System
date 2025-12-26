using IMS.Domain.Common;
using System;

namespace IMS.Domain.Entities.Purchase
{
    public class PurchaseOrderLine : BaseEntity
    {
        public Guid PurchaseOrderId { get; set; }
        public Guid ItemId { get; set; }
        public decimal QuantityOrdered { get; set; }
        public decimal UnitPrice { get; set; }
        // quantity that has been received against this PO line (updated when GRN is received)
        public decimal ReceivedQuantity { get; set; }
    }
}
