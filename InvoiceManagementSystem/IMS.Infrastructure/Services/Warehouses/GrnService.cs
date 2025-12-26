using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Purchase;
using IMS.Domain.Entities.Warehouse;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Warehouses
{
    public class GrnService : IGrnService
    {
        private readonly IRepository<GoodsReceivedNote> _grnRepo;
        private readonly IRepository<GoodsReceivedNoteLine> _grnLineRepo;
        private readonly IRepository<Stock> _stockRepo;
        private readonly IRepository<StockTransaction> _stockTxRepo;
        private readonly IRepository<PurchaseOrder>? _poRepo;
        private readonly IRepository<PurchaseOrderLine>? _poLineRepo;

        public GrnService(IRepository<GoodsReceivedNote> grnRepo,
            IRepository<GoodsReceivedNoteLine> grnLineRepo,
            IRepository<Stock> stockRepo,
            IRepository<StockTransaction> stockTxRepo,
            IRepository<PurchaseOrder>? poRepo = null,
            IRepository<PurchaseOrderLine>? poLineRepo = null)
        {
            _grnRepo = grnRepo;
            _grnLineRepo = grnLineRepo;
            _stockRepo = stockRepo;
            _stockTxRepo = stockTxRepo;
            _poRepo = poRepo;
            _poLineRepo = poLineRepo;
        }

        public async Task<GrnDto> CreateAsync(CreateGrnDto dto)
        {
            var grn = new GoodsReceivedNote
            {
                Id = Guid.NewGuid(),
                VendorId = dto.VendorId,
                WarehouseId = dto.WarehouseId,
                PurchaseOrderId = dto.PurchaseOrderId,
                Reference = dto.Reference,
                ReceivedDate = DateTime.UtcNow,
                IsReceived = false
            };

            await _grnRepo.AddAsync(grn);

            foreach (var l in dto.Lines)
            {
                var line = new GoodsReceivedNoteLine
                {
                    Id = Guid.NewGuid(),
                    GoodsReceivedNoteId = grn.Id,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice
                };
                await _grnLineRepo.AddAsync(line);
            }

            await _grnRepo.SaveChangesAsync();
            await _grnLineRepo.SaveChangesAsync();

            return new GrnDto
            {
                Id = grn.Id,
                VendorId = grn.VendorId,
                WarehouseId = grn.WarehouseId,
                PurchaseOrderId = grn.PurchaseOrderId,
                Reference = grn.Reference,
                ReceivedDate = grn.ReceivedDate,
                IsReceived = grn.IsReceived,
                Lines = dto.Lines.Select(l => new GrnLineDto { Id = Guid.Empty, ItemId = l.ItemId, Quantity = l.Quantity, UnitPrice = l.UnitPrice }).ToList()
            };
        }

        public async Task<GrnDto?> UpdateAsync(Guid id, CreateGrnDto dto)
        {
            var grn = await _grnRepo.GetByIdAsync(id);
            if (grn == null || grn.IsReceived) return null;

            grn.VendorId = dto.VendorId;
            grn.WarehouseId = dto.WarehouseId;
            grn.PurchaseOrderId = dto.PurchaseOrderId;
            grn.Reference = dto.Reference;

            _grnRepo.Update(grn);

            var existingLines = (await _grnLineRepo.GetAllAsync()).Where(l => l.GoodsReceivedNoteId == id).ToList();
            foreach (var line in existingLines)
            {
                _grnLineRepo.Delete(line);
            }

            foreach (var l in dto.Lines)
            {
                var line = new GoodsReceivedNoteLine
                {
                    Id = Guid.NewGuid(),
                    GoodsReceivedNoteId = grn.Id,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice
                };
                await _grnLineRepo.AddAsync(line);
            }

            await _grnRepo.SaveChangesAsync();
            await _grnLineRepo.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<IEnumerable<GrnDto>> GetAllAsync()
        {
            var list = await _grnRepo.GetAllAsync();
            return list.Select(g => new GrnDto { Id = g.Id, VendorId = g.VendorId, WarehouseId = g.WarehouseId, PurchaseOrderId = g.PurchaseOrderId, Reference = g.Reference, ReceivedDate = g.ReceivedDate, IsReceived = g.IsReceived }).ToList();
        }

        public async Task<GrnDto?> GetByIdAsync(Guid id)
        {
            var g = await _grnRepo.GetByIdAsync(id);
            if (g == null) return null;
            // load lines via repo GetAll and filter - simple approach
            var allLines = await _grnLineRepo.GetAllAsync();
            var lines = allLines.Where(l => l.GoodsReceivedNoteId == g.Id)
                .Select(l => new GrnLineDto { Id = l.Id, ItemId = l.ItemId, Quantity = l.Quantity, UnitPrice = l.UnitPrice })
                .ToList();
            return new GrnDto { Id = g.Id, VendorId = g.VendorId, WarehouseId = g.WarehouseId, PurchaseOrderId = g.PurchaseOrderId, Reference = g.Reference, ReceivedDate = g.ReceivedDate, IsReceived = g.IsReceived, Lines = lines };
        }

        public async Task<bool> ReceiveAsync(Guid id)
        {
            var grn = await _grnRepo.GetByIdAsync(id);
            if (grn == null) return false;
            if (grn.IsReceived) return false; // idempotent

            var lines = (await _grnLineRepo.GetAllAsync()).Where(l => l.GoodsReceivedNoteId == id).ToList();

            // If GRN is linked to a Purchase Order, ensure PO is approved
            PurchaseOrder? po = null;
            List<PurchaseOrderLine>? poLines = null;
            if (grn.PurchaseOrderId.HasValue && _poRepo != null && _poLineRepo != null)
            {
                po = await _poRepo.GetByIdAsync(grn.PurchaseOrderId.Value);
                if (po == null) return false;
                if (!po.IsApproved) return false; // cannot receive against unapproved PO

                poLines = (await _poLineRepo.GetAllAsync()).Where(pl => pl.PurchaseOrderId == po.Id).ToList();
            }

            // update stock and create stock transactions
            foreach (var l in lines)
            {
                var stock = (await _stockRepo.GetAllAsync()).FirstOrDefault(s => s.ItemId == l.ItemId && s.WarehouseId == grn.WarehouseId);
                if (stock == null)
                {
                    stock = new Stock { Id = Guid.NewGuid(), ItemId = l.ItemId, WarehouseId = grn.WarehouseId, Quantity = l.Quantity, IsActive = true, IsDeleted = false };
                    await _stockRepo.AddAsync(stock);
                }
                else
                {
                    stock.Quantity += l.Quantity;
                    _stockRepo.Update(stock);
                }

                var tx = new StockTransaction
                {
                    Id = Guid.NewGuid(),
                    ItemId = l.ItemId,
                    WarehouseId = grn.WarehouseId,
                    Quantity = l.Quantity,
                    TransactionType = Domain.Enums.StockTransactionType.In,
                    Reference = grn.Reference
                };
                await _stockTxRepo.AddAsync(tx);

                // If linked to PO, update received quantity on matching PO line(s)
                if (po != null && poLines != null)
                {
                    var poLine = poLines.FirstOrDefault(pl => pl.ItemId == l.ItemId);
                    if (poLine != null)
                    {
                        poLine.ReceivedQuantity += l.Quantity;
                        _poLineRepo.Update(poLine);
                    }
                }
            }

            grn.IsReceived = true;
            _grnRepo.Update(grn);

            await _stockRepo.SaveChangesAsync();
            await _stockTxRepo.SaveChangesAsync();
            if (_poLineRepo != null) await _poLineRepo.SaveChangesAsync();
            if (_poRepo != null && po != null)
            {
                // if all PO lines fully received, close the PO
                var allReceived = (await _poLineRepo.GetAllAsync()).Where(pl => pl.PurchaseOrderId == po.Id).All(pl => pl.ReceivedQuantity >= pl.QuantityOrdered);
                if (allReceived)
                {
                    po.IsClosed = true;
                    _poRepo.Update(po);
                    await _poRepo.SaveChangesAsync();
                }
            }
            await _grnRepo.SaveChangesAsync();

            return true;
        }
    }
}
