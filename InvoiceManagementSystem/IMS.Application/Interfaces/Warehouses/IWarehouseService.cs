using IMS.Application.DTOs.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Warehouses
{
    public interface IWarehouseService
    {
        Task<IEnumerable<WarehouseDto>> GetAllAsync();
        Task<WarehouseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<WarehouseDto>> GetByBranchIdAsync(Guid branchId);
        Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto);
        Task<WarehouseDto?> UpdateAsync(Guid id, CreateWarehouseDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
