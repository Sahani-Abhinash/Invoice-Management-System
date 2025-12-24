using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Warehouses
{
    public class StockManager : IStockManager
    {
        private readonly IStockService _stockService;

        public StockManager(IStockService stockService)
        {
            _stockService = stockService;
        }

        public async Task<IEnumerable<StockDto>> GetAllAsync() => await _stockService.GetAllAsync();

        public async Task<StockDto?> GetByIdAsync(Guid id) => await _stockService.GetByIdAsync(id);

        public async Task<IEnumerable<StockDto>> GetByWarehouseIdAsync(Guid warehouseId) => await _stockService.GetByWarehouseIdAsync(warehouseId);

        public async Task<StockDto> CreateAsync(CreateStockDto dto) => await _stockService.CreateAsync(dto);

        public async Task<StockDto?> UpdateAsync(Guid id, CreateStockDto dto) => await _stockService.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _stockService.DeleteAsync(id);
    }
}
