using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Warehouse;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Warehouses
{
    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly IRepository<PurchaseOrder> _poRepo;
        private readonly IRepository<PurchaseOrderLine> _poLineRepo;

        public PurchaseOrderService(IRepository<PurchaseOrder> poRepo, IRepository<PurchaseOrderLine> poLineRepo)
        {
            _poRepo = poRepo;
            _poLineRepo = poLineRepo;
        }

        public async Task<PurchaseOrderDto> CreateAsync(CreatePurchaseOrderDto dto)
        {
            var po = new PurchaseOrder
            {
                Id = Guid.NewGuid(),
                VendorId = dto.VendorId,
                WarehouseId = dto.WarehouseId,
                OrderDate = DateTime.UtcNow,
                Reference = dto.Reference,
                IsApproved = false,
                IsClosed = false
            };
            await _poRepo.AddAsync(po);
            foreach (var l in dto.Lines)
            {
                var line = new PurchaseOrderLine { Id = Guid.NewGuid(), PurchaseOrderId = po.Id, ItemId = l.ItemId, QuantityOrdered = l.QuantityOrdered, UnitPrice = l.UnitPrice };
                await _poLineRepo.AddAsync(line);
            }
            await _poRepo.SaveChangesAsync();
            await _poLineRepo.SaveChangesAsync();

            return new PurchaseOrderDto { Id = po.Id, VendorId = po.VendorId, WarehouseId = po.WarehouseId, OrderDate = po.OrderDate, Reference = po.Reference, IsApproved = po.IsApproved, IsClosed = po.IsClosed, Lines = dto.Lines.Select(x => new PurchaseOrderLineDto { Id = Guid.Empty, ItemId = x.ItemId, QuantityOrdered = x.QuantityOrdered, UnitPrice = x.UnitPrice }).ToList() };
        }

        public async Task<IEnumerable<PurchaseOrderDto>> GetAllAsync()
        {
            var list = await _poRepo.GetAllAsync();
            return list.Select(p => new PurchaseOrderDto { Id = p.Id, VendorId = p.VendorId, WarehouseId = p.WarehouseId, OrderDate = p.OrderDate, Reference = p.Reference, IsApproved = p.IsApproved, IsClosed = p.IsClosed }).ToList();
        }

        public async Task<PurchaseOrderDto?> GetByIdAsync(Guid id)
        {
            var p = await _poRepo.GetByIdAsync(id);
            if (p == null) return null;
            var lines = (await _poLineRepo.GetAllAsync()).Where(l => l.PurchaseOrderId == id).Select(l => new PurchaseOrderLineDto { Id = l.Id, ItemId = l.ItemId, QuantityOrdered = l.QuantityOrdered, UnitPrice = l.UnitPrice }).ToList();
            return new PurchaseOrderDto { Id = p.Id, VendorId = p.VendorId, WarehouseId = p.WarehouseId, OrderDate = p.OrderDate, Reference = p.Reference, IsApproved = p.IsApproved, IsClosed = p.IsClosed, Lines = lines };
        }

        public async Task<PurchaseOrderDto?> ApproveAsync(Guid id)
        {
            var p = await _poRepo.GetByIdAsync(id);
            if (p == null) return null;
            p.IsApproved = true;
            _poRepo.Update(p);
            await _poRepo.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> CloseAsync(Guid id)
        {
            var p = await _poRepo.GetByIdAsync(id);
            if (p == null) return false;
            p.IsClosed = true;
            _poRepo.Update(p);
            await _poRepo.SaveChangesAsync();
            return true;
        }
    }
}
