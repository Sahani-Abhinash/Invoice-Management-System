using System;

namespace IMS.Application.DTOs.Warehouses
{
    public class CreateStockDto
    {
        public Guid ItemId { get; set; }
        public Guid WarehouseId { get; set; }
        public decimal Quantity { get; set; }
    }
}
