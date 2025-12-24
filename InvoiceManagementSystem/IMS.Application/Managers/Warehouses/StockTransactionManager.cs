using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Warehouses
{
    public class StockTransactionManager : IStockTransactionManager
    {
        private readonly IStockTransactionService _service;

        public StockTransactionManager(IStockTransactionService service)
        {
            _service = service;
        }

        public async Task<IEnumerable<StockTransactionDto>> GetAllAsync() => await _service.GetAllAsync();

        public async Task<StockTransactionDto?> GetByIdAsync(Guid id) => await _service.GetByIdAsync(id);

        public async Task<IEnumerable<StockTransactionDto>> GetByWarehouseIdAsync(Guid warehouseId) => await _service.GetByWarehouseIdAsync(warehouseId);

        public async Task<IEnumerable<StockTransactionDto>> GetByItemIdAsync(Guid itemId) => await _service.GetByItemIdAsync(itemId);

        public async Task<StockTransactionDto> CreateAsync(CreateStockTransactionDto dto) => await _service.CreateAsync(dto);

        public async Task<bool> DeleteAsync(Guid id) => await _service.DeleteAsync(id);
    }
}
