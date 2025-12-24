using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Warehouses
{
    public class WarehouseManager : IWarehouseManager
    {
        private readonly IWarehouseService _warehouseService;

        public WarehouseManager(IWarehouseService warehouseService)
        {
            _warehouseService = warehouseService;
        }

        public async Task<IEnumerable<WarehouseDto>> GetAllAsync() => await _warehouseService.GetAllAsync();

        public async Task<WarehouseDto?> GetByIdAsync(Guid id) => await _warehouseService.GetByIdAsync(id);

        public async Task<IEnumerable<WarehouseDto>> GetByBranchIdAsync(Guid branchId) => await _warehouseService.GetByBranchIdAsync(branchId);

        public async Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto) => await _warehouseService.CreateAsync(dto);

        public async Task<WarehouseDto?> UpdateAsync(Guid id, CreateWarehouseDto dto) => await _warehouseService.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _warehouseService.DeleteAsync(id);
    }
}
