using IMS.Application.DTOs.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Warehouses
{
    public interface IStockService
    {
        Task<IEnumerable<StockDto>> GetAllAsync();
        Task<StockDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<StockDto>> GetByWarehouseIdAsync(Guid warehouseId);
        Task<StockDto> CreateAsync(CreateStockDto dto);
        Task<StockDto?> UpdateAsync(Guid id, CreateStockDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
