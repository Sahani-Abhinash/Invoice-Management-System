using IMS.Domain.Enums;
using System;

namespace IMS.Application.DTOs.Warehouses
{
    public class CreateStockTransactionDto
    {
        public Guid ItemId { get; set; }
        public Guid WarehouseId { get; set; }
        public decimal Quantity { get; set; }
        public StockTransactionType TransactionType { get; set; }
        public string Reference { get; set; } = string.Empty;
    }
}
