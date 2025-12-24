using IMS.Application.DTOs.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Warehouses
{
    public interface IStockTransactionService
    {
        Task<IEnumerable<StockTransactionDto>> GetAllAsync();
        Task<StockTransactionDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<StockTransactionDto>> GetByWarehouseIdAsync(Guid warehouseId);
        Task<IEnumerable<StockTransactionDto>> GetByItemIdAsync(Guid itemId);
        Task<StockTransactionDto> CreateAsync(CreateStockTransactionDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
