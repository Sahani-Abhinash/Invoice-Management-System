using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Warehouses
{
    public class CreateGrnLineDto
    {
        public Guid ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class CreateGrnDto
    {
        // REQUIRED link to originating purchase order
        public Guid PurchaseOrderId { get; set; }
        public string Reference { get; set; } = string.Empty;
        public Guid? AccountId { get; set; }
        public List<CreateGrnLineDto> Lines { get; set; } = new List<CreateGrnLineDto>();
    }
}
