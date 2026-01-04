using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Transaction;
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
        private readonly IRepository<GrnPayment> _grnPaymentRepo;
        private readonly IRepository<PurchaseOrder>? _poRepo;
        private readonly IRepository<PurchaseOrderLine>? _poLineRepo;
        private readonly ITransactionService? _transactionService;

        public GrnService(IRepository<GoodsReceivedNote> grnRepo,
            IRepository<GoodsReceivedNoteLine> grnLineRepo,
            IRepository<Stock> stockRepo,
            IRepository<StockTransaction> stockTxRepo,
            IRepository<GrnPayment> grnPaymentRepo,
            IRepository<PurchaseOrder>? poRepo = null,
            IRepository<PurchaseOrderLine>? poLineRepo = null,
            ITransactionService? transactionService = null)
        {
            _grnRepo = grnRepo;
            _grnLineRepo = grnLineRepo;
            _stockRepo = stockRepo;
            _stockTxRepo = stockTxRepo;
            _grnPaymentRepo = grnPaymentRepo;
            _poRepo = poRepo;
            _poLineRepo = poLineRepo;
            _transactionService = transactionService;
        }

        public async Task<GrnDto> CreateAsync(CreateGrnDto dto)
        {
            var grn = new GoodsReceivedNote
            {
                Id = Guid.NewGuid(),
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
            var allLines = await _grnLineRepo.GetAllAsync();
            var allPayments = await _grnPaymentRepo.GetAllAsync();

            return list.Select(g =>
            {
                // Calculate payment status manually since navigation properties aren't loaded
                var lines = allLines.Where(l => l.GoodsReceivedNoteId == g.Id).ToList();
                var payments = allPayments.Where(p => p.GrnId == g.Id).ToList();
                var total = lines.Sum(l => l.Quantity * l.UnitPrice);
                var paid = payments.Sum(p => p.Amount);

                string paymentStatus = "Unpaid";
                if (paid > 0)
                {
                    paymentStatus = paid >= total ? "FullyPaid" : "PartiallyPaid";
                }

                return new GrnDto
                {
                    Id = g.Id,
                    PurchaseOrderId = g.PurchaseOrderId,
                    Reference = g.Reference,
                    ReceivedDate = g.ReceivedDate,
                    IsReceived = g.IsReceived,
                    PaymentStatus = paymentStatus
                };
            }).ToList();
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

            // Calculate payment status manually since navigation properties aren't loaded
            var allPayments = await _grnPaymentRepo.GetAllAsync();
            var payments = allPayments.Where(p => p.GrnId == g.Id).ToList();
            var total = lines.Sum(l => l.Quantity * l.UnitPrice);
            var paid = payments.Sum(p => p.Amount);

            string paymentStatus = "Unpaid";
            if (paid > 0)
            {
                paymentStatus = paid >= total ? "FullyPaid" : "PartiallyPaid";
            }

            return new GrnDto 
            { 
                Id = g.Id, 
                PurchaseOrderId = g.PurchaseOrderId, 
                Reference = g.Reference, 
                ReceivedDate = g.ReceivedDate, 
                IsReceived = g.IsReceived, 
                PaymentStatus = paymentStatus,
                Lines = lines 
            };
        }

        public async Task<bool> ReceiveAsync(Guid id)
        {
            var grn = await _grnRepo.GetByIdAsync(id);
            if (grn == null) return false;
            if (grn.IsReceived) return false; // idempotent

            var lines = (await _grnLineRepo.GetAllAsync()).Where(l => l.GoodsReceivedNoteId == id).ToList();

            // GRN must be linked to a Purchase Order
            if (_poRepo == null || _poLineRepo == null) return false;
            
            var po = await _poRepo.GetByIdAsync(grn.PurchaseOrderId);
            if (po == null) return false;
            if (!po.IsApproved) return false; // cannot receive against unapproved PO

            var poLines = (await _poLineRepo.GetAllAsync()).Where(pl => pl.PurchaseOrderId == po.Id).ToList();

            // Get warehouse from the PO
            var warehouseId = po.WarehouseId;

            // update stock and create stock transactions
            foreach (var l in lines)
            {
                var stock = (await _stockRepo.GetAllAsync()).FirstOrDefault(s => s.ItemId == l.ItemId && s.WarehouseId == warehouseId);
                if (stock == null)
                {
                    stock = new Stock { Id = Guid.NewGuid(), ItemId = l.ItemId, WarehouseId = warehouseId, Quantity = l.Quantity, IsActive = true, IsDeleted = false };
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
                    WarehouseId = warehouseId,
                    Quantity = l.Quantity,
                    TransactionType = Domain.Enums.StockTransactionType.In,
                    Reference = grn.Reference
                };
                await _stockTxRepo.AddAsync(tx);

                // Update received quantity on matching PO line(s)
                var poLine = poLines.FirstOrDefault(pl => pl.ItemId == l.ItemId);
                if (poLine != null)
                {
                    poLine.ReceivedQuantity += l.Quantity;
                    _poLineRepo.Update(poLine);
                }
            }

            grn.IsReceived = true;
            _grnRepo.Update(grn);

            await _stockRepo.SaveChangesAsync();
            await _stockTxRepo.SaveChangesAsync();
            await _poLineRepo.SaveChangesAsync();
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

        public async Task<GrnPaymentDto> RecordPaymentAsync(Guid grnId, RecordGrnPaymentDto dto)
        {
            var grn = await _grnRepo.GetByIdAsync(grnId);
            if (grn == null)
                throw new InvalidOperationException($"GRN with ID {grnId} not found.");

            var payment = new GrnPayment
            {
                Id = Guid.NewGuid(),
                GrnId = grnId,
                Amount = dto.Amount,
                Method = dto.Method,
                PaidAt = DateTime.UtcNow,
                DueDate = dto.DueDate
            };

            await _grnPaymentRepo.AddAsync(payment);
            await _grnPaymentRepo.SaveChangesAsync();

            // Create Debit transaction for payment (expense/outflow)
            if (_transactionService != null)
            {
                var paymentMethod = dto.Method.ToString();
                await _transactionService.CreateFromSourceAsync(
                    payment.Id,
                    "GRN_Payment",
                    Domain.Enums.TransactionType.Debit,
                    dto.Amount,
                    "Payment",
                    $"Payment for GRN {grn.Reference} via {paymentMethod}"
                );
            }

            return new GrnPaymentDto
            {
                Id = payment.Id,
                Amount = payment.Amount,
                Method = payment.Method,
                Date = payment.PaidAt,
                DueDate = payment.DueDate
            };
        }

        public async Task<GrnPaymentDetailsDto?> GetPaymentDetailsAsync(Guid grnId)
        {
            var grn = await _grnRepo.GetByIdAsync(grnId);
            if (grn == null)
                return null;

            var allPayments = await _grnPaymentRepo.GetAllAsync();
            var payments = allPayments.Where(p => p.GrnId == grnId).ToList();

            var allLines = await _grnLineRepo.GetAllAsync();
            var lines = allLines.Where(l => l.GoodsReceivedNoteId == grnId).ToList();
            
            var total = lines.Sum(l => l.Quantity * l.UnitPrice);
            var paidAmount = payments.Sum(p => p.Amount);

            // Calculate payment status manually since navigation properties aren't loaded
            string paymentStatus = "Unpaid";
            if (paidAmount > 0)
            {
                paymentStatus = paidAmount >= total ? "FullyPaid" : "PartiallyPaid";
            }

            return new GrnPaymentDetailsDto
            {
                Id = grn.Id,
                Reference = grn.Reference,
                Total = total,
                PaidAmount = paidAmount,
                BalanceDue = total - paidAmount,
                PaymentStatus = paymentStatus,
                Payments = payments.Select(p => new GrnPaymentDto
                {
                    Id = p.Id,
                    Amount = p.Amount,
                    Method = p.Method,
                    Date = p.PaidAt,
                    DueDate = p.DueDate
                }).ToList()
            };
        }
    }
}
