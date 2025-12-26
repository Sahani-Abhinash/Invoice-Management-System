using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Warehouses
{
    public class GrnLineDto
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class GrnDto
    {
        public Guid Id { get; set; }
        public Guid VendorId { get; set; }
        public Guid WarehouseId { get; set; }
        public DateTime ReceivedDate { get; set; }
        public string Reference { get; set; } = string.Empty;
        public bool IsReceived { get; set; }
        public List<GrnLineDto> Lines { get; set; } = new List<GrnLineDto>();
    }
}
