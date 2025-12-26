using IMS.Application.DTOs.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Warehouses
{
    public interface IPurchaseOrderService
    {
        Task<IEnumerable<PurchaseOrderDto>> GetAllAsync();
        Task<PurchaseOrderDto?> GetByIdAsync(Guid id);
        Task<PurchaseOrderDto> CreateAsync(CreatePurchaseOrderDto dto);
        Task<PurchaseOrderDto?> ApproveAsync(Guid id);
        Task<bool> CloseAsync(Guid id);
    }
}
