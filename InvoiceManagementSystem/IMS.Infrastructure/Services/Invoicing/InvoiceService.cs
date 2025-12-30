using IMS.Application.DTOs.Invoicing;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Invoicing;
using IMS.Domain.Entities.Invoicing;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Invoicing
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IRepository<Invoice> _invoiceRepo;
        private readonly IRepository<InvoiceItem> _itemRepo;
        private readonly IRepository<IMS.Domain.Entities.Warehouse.Stock> _stockRepo;
        private readonly IRepository<IMS.Domain.Entities.Warehouse.StockTransaction> _stockTxRepo;
        private readonly IRepository<IMS.Domain.Entities.Warehouse.Warehouse> _warehouseRepo;
        private readonly IPaymentService _paymentService;

        public InvoiceService(IRepository<Invoice> invoiceRepo,
            IRepository<InvoiceItem> itemRepo,
            IRepository<IMS.Domain.Entities.Warehouse.Stock> stockRepo,
            IRepository<IMS.Domain.Entities.Warehouse.StockTransaction> stockTxRepo,
            IRepository<IMS.Domain.Entities.Warehouse.Warehouse> warehouseRepo,
            IPaymentService paymentService)
        {
            _invoiceRepo = invoiceRepo;
            _itemRepo = itemRepo;
            _stockRepo = stockRepo;
            _stockTxRepo = stockTxRepo;
            _warehouseRepo = warehouseRepo;
            _paymentService = paymentService;
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllAsync()
        {
            var list = await _invoiceRepo.GetAllAsync();
            return list.Select(i => MapToDto(i, null)).ToList();
        }

        public async Task<InvoiceDto?> GetByIdAsync(Guid id)
        {
            var i = await _invoiceRepo.GetByIdAsync(id);
            if (i == null) return null;

            var lines = (await _itemRepo.GetAllAsync()).Where(l => l.InvoiceId == id).ToList();
            return MapToDto(i, lines);
        }

        public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto)
        {
            var subtotal = dto.Lines.Sum(l => l.Quantity * l.UnitPrice);
            var tax = subtotal * (dto.TaxRate / 100);
            var total = subtotal + tax;

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                Reference = dto.Reference,
                PoNumber = dto.PoNumber,
                InvoiceDate = dto.InvoiceDate,
                DueDate = dto.DueDate,
                CustomerId = dto.CustomerId,
                BranchId = dto.BranchId,
                SubTotal = subtotal,
                Tax = tax,
                Total = total,
                IsPaid = false
            };

            await _invoiceRepo.AddAsync(invoice);

            var lines = new List<InvoiceItem>();
            foreach (var l in dto.Lines)
            {
                var item = new InvoiceItem
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice,
                    LineTotal = l.Quantity * l.UnitPrice
                };
                await _itemRepo.AddAsync(item);
                lines.Add(item);
            }

            await _invoiceRepo.SaveChangesAsync();
            await _itemRepo.SaveChangesAsync();

            // Update stock and create OUT transactions for each sold line
            try
            {
                // determine target warehouse for this invoice via branch -> pick first warehouse for branch
                IMS.Domain.Entities.Warehouse.Warehouse? targetWarehouse = null;
                if (invoice.BranchId.HasValue)
                {
                    targetWarehouse = (await _warehouseRepo.GetAllAsync()).FirstOrDefault(w => w.BranchId == invoice.BranchId.Value);
                }

                foreach (var l in lines)
                {
                    if (targetWarehouse == null) continue; // no warehouse found -> skip stock changes

                    var stock = (await _stockRepo.GetAllAsync()).FirstOrDefault(s => s.ItemId == l.ItemId && s.WarehouseId == targetWarehouse.Id);
                    if (stock == null)
                    {
                        // create stock record with negative quantity to reflect outflow when no stock existed
                        stock = new IMS.Domain.Entities.Warehouse.Stock
                        {
                            Id = Guid.NewGuid(),
                            ItemId = l.ItemId,
                            WarehouseId = targetWarehouse.Id,
                            Quantity = -l.Quantity,
                            IsActive = true,
                            IsDeleted = false
                        };
                        await _stockRepo.AddAsync(stock);
                    }
                    else
                    {
                        stock.Quantity -= l.Quantity;
                        _stockRepo.Update(stock);
                    }

                    var tx = new IMS.Domain.Entities.Warehouse.StockTransaction
                    {
                        Id = Guid.NewGuid(),
                        ItemId = l.ItemId,
                        WarehouseId = targetWarehouse.Id,
                        Quantity = l.Quantity,
                        TransactionType = StockTransactionType.Out,
                        Reference = invoice.Reference
                    };
                    await _stockTxRepo.AddAsync(tx);
                }

                await _stockRepo.SaveChangesAsync();
                await _stockTxRepo.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Do not fail invoice creation for transient stock update issues; log if logger available
                Console.WriteLine($"InvoiceService: stock update failed: {ex.Message}");
            }

            return MapToDto(invoice, lines);
        }

        public async Task<InvoiceDto?> UpdateAsync(Guid id, CreateInvoiceDto dto)
        {
            var invoice = await _invoiceRepo.GetByIdAsync(id);
            if (invoice == null || invoice.IsPaid) return null;

            var subtotal = dto.Lines.Sum(l => l.Quantity * l.UnitPrice);
            var tax = subtotal * (dto.TaxRate / 100);
            var total = subtotal + tax;

            invoice.Reference = dto.Reference;
            invoice.PoNumber = dto.PoNumber;
            invoice.InvoiceDate = dto.InvoiceDate;
            invoice.DueDate = dto.DueDate;
            invoice.CustomerId = dto.CustomerId;
            invoice.BranchId = dto.BranchId;
            invoice.SubTotal = subtotal;
            invoice.Tax = tax;
            invoice.Total = total;

            _invoiceRepo.Update(invoice);

            // Replace lines
            var existingLines = (await _itemRepo.GetAllAsync()).Where(l => l.InvoiceId == id).ToList();
            foreach (var line in existingLines)
            {
                _itemRepo.Delete(line);
            }

            var lines = new List<InvoiceItem>();
            foreach (var l in dto.Lines)
            {
                var item = new InvoiceItem
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice,
                    LineTotal = l.Quantity * l.UnitPrice
                };
                await _itemRepo.AddAsync(item);
                lines.Add(item);
            }

            await _invoiceRepo.SaveChangesAsync();
            await _itemRepo.SaveChangesAsync();

            return MapToDto(invoice, lines);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var invoice = await _invoiceRepo.GetByIdAsync(id);
            if (invoice == null || invoice.IsPaid) return false;

            var existingLines = (await _itemRepo.GetAllAsync()).Where(l => l.InvoiceId == id).ToList();
            foreach (var line in existingLines)
            {
                _itemRepo.Delete(line);
            }

            _invoiceRepo.Delete(invoice);
            await _invoiceRepo.SaveChangesAsync();
            await _itemRepo.SaveChangesAsync();

            return true;
        }

        public async Task<bool> MarkAsPaidAsync(Guid id)
        {
            var invoice = await _invoiceRepo.GetByIdAsync(id);
            if (invoice == null) return false;

            invoice.IsPaid = true;
            invoice.PaymentStatus = PaymentStatus.FullyPaid;
            _invoiceRepo.Update(invoice);
            await _invoiceRepo.SaveChangesAsync();

            return true;
        }

        public async Task<PaymentDto> RecordPaymentAsync(Guid invoiceId, RecordPaymentDto dto)
        {
            return await _paymentService.RecordPaymentAsync(invoiceId, dto);
        }

        public async Task<InvoicePaymentDetailsDto> GetPaymentDetailsAsync(Guid invoiceId)
        {
            return await _paymentService.GetInvoicePaymentDetailsAsync(invoiceId);
        }

        public async Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId)
        {
            return await _paymentService.GetPaymentByIdAsync(paymentId);
        }

        private InvoiceDto MapToDto(Invoice i, List<InvoiceItem>? lines)
        {
            return new InvoiceDto
            {
                Id = i.Id,
                Reference = i.Reference,
                PoNumber = i.PoNumber,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                CustomerId = i.CustomerId,
                BranchId = i.BranchId,
                SubTotal = i.SubTotal,
                Tax = i.Tax,
                Total = i.Total,
                PaidAmount = i.PaidAmount,
                IsPaid = i.IsPaid,
                PaymentStatus = i.PaymentStatus.ToString(),
                Lines = lines?.Select(l => new InvoiceItemDto
                {
                    Id = l.Id,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice,
                    LineTotal = l.LineTotal
                }).ToList() ?? new List<InvoiceItemDto>(),
                Payments = new List<PaymentDto>()
            };
        }
    }
}
