using IMS.Application.DTOs.Product;
using IMS.Application.DTOs.Warehouses;
using System;

namespace IMS.Application.DTOs.Warehouses
{
    public class StockDto
    {
        public Guid Id { get; set; }
        public IMS.Application.DTOs.Product.ItemDto Item { get; set; } = null!;
        public WarehouseDto Warehouse { get; set; } = null!;
        public decimal Quantity { get; set; }
    }
}
