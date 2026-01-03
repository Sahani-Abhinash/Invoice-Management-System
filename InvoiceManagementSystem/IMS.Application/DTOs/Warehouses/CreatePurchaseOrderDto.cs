using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Warehouses
{
    public class CreatePurchaseOrderLineDto
    {
        public Guid ItemId { get; set; }
        public decimal QuantityOrdered { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class CreatePurchaseOrderDto
    {
        public Guid VendorId { get; set; }
        public Guid WarehouseId { get; set; }
        public string Reference { get; set; } = string.Empty;
        public Guid? AccountId { get; set; }
        public List<CreatePurchaseOrderLineDto> Lines { get; set; } = new List<CreatePurchaseOrderLineDto>();
    }
}
