using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Warehouses
{
    public class PurchaseOrderLineDto
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public decimal QuantityOrdered { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal ReceivedQuantity { get; set; }
    }

    public class PurchaseOrderDto
    {
        public Guid Id { get; set; }
        public Guid VendorId { get; set; }
        public Guid WarehouseId { get; set; }
        public DateTime OrderDate { get; set; }
        public string Reference { get; set; } = string.Empty;
        public bool IsApproved { get; set; }
        public bool IsClosed { get; set; }
        public Guid? AccountId { get; set; }
        public List<PurchaseOrderLineDto> Lines { get; set; } = new List<PurchaseOrderLineDto>();
    }
}
