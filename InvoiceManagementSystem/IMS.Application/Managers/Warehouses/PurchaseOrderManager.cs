using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Warehouses
{
    public class PurchaseOrderManager : IPurchaseOrderManager
    {
        private readonly IPurchaseOrderService _service;

        public PurchaseOrderManager(IPurchaseOrderService service)
        {
            _service = service;
        }

        public Task<IEnumerable<PurchaseOrderDto>> GetAllAsync() => _service.GetAllAsync();
        public Task<PurchaseOrderDto?> GetByIdAsync(Guid id) => _service.GetByIdAsync(id);
        public Task<PurchaseOrderDto> CreateAsync(CreatePurchaseOrderDto dto) => _service.CreateAsync(dto);
        public Task<PurchaseOrderDto?> UpdateAsync(Guid id, CreatePurchaseOrderDto dto) => _service.UpdateAsync(id, dto);
        public Task<PurchaseOrderDto?> ApproveAsync(Guid id) => _service.ApproveAsync(id);
        public Task<bool> CloseAsync(Guid id) => _service.CloseAsync(id);
    }
}
