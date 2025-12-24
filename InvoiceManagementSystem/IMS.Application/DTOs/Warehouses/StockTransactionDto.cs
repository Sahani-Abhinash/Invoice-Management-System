using System;

namespace IMS.Application.DTOs.Warehouses
{
    public class StockTransactionDto
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public Guid WarehouseId { get; set; }
        public decimal Quantity { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
    }
}
