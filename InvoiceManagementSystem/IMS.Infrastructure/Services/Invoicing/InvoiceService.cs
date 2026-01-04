using IMS.Application.DTOs.Invoicing;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Invoicing;
using IMS.Application.Interfaces.Transaction;
using IMS.Domain.Entities.Invoicing;
using IMS.Domain.Entities.Pricing;
using IMS.Domain.Entities.Product;
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
        private readonly IRepository<ItemPrice> _itemPriceRepo;
        private readonly IRepository<PriceList> _priceListRepo;
        private readonly IRepository<IMS.Domain.Entities.Warehouse.Stock> _stockRepo;
        private readonly IRepository<IMS.Domain.Entities.Warehouse.StockTransaction> _stockTxRepo;
        private readonly IRepository<IMS.Domain.Entities.Warehouse.Warehouse> _warehouseRepo;
        private readonly IPaymentService _paymentService;
        private readonly ITransactionService? _transactionService;

        public InvoiceService(IRepository<Invoice> invoiceRepo,
            IRepository<InvoiceItem> itemRepo,
            IRepository<ItemPrice> itemPriceRepo,
            IRepository<PriceList> priceListRepo,
            IRepository<IMS.Domain.Entities.Warehouse.Stock> stockRepo,
            IRepository<IMS.Domain.Entities.Warehouse.StockTransaction> stockTxRepo,
            IRepository<IMS.Domain.Entities.Warehouse.Warehouse> warehouseRepo,
            IPaymentService paymentService,
            ITransactionService? transactionService = null)
        {
            _invoiceRepo = invoiceRepo;
            _itemRepo = itemRepo;
            _itemPriceRepo = itemPriceRepo;
            _priceListRepo = priceListRepo;
            _stockRepo = stockRepo;
            _stockTxRepo = stockTxRepo;
            _warehouseRepo = warehouseRepo;
            _paymentService = paymentService;
            _transactionService = transactionService;
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
            // Determine which PriceList to use
            PriceList? selectedPriceList = null;

            if (dto.PriceListId.HasValue)
            {
                // User explicitly selected a price list
                selectedPriceList = await _priceListRepo.GetByIdAsync(dto.PriceListId.Value);
            }
            else
            {
                // Fall back to default price list
                var allPriceLists = await _priceListRepo.GetAllAsync();
                selectedPriceList = allPriceLists.FirstOrDefault(p => p.IsDefault);
            }

            if (selectedPriceList == null)
                throw new InvalidOperationException("No valid price list found. Please select a price list or set a default.");

            // Fetch all item prices for the selected price list
            var allItemPrices = await _itemPriceRepo.GetAllAsync();
            var priceListItemPrices = allItemPrices
                .Where(ip => ip.PriceListId == selectedPriceList.Id &&
                           ip.EffectiveFrom <= DateTime.UtcNow &&
                           (ip.EffectiveTo == null || ip.EffectiveTo >= DateTime.UtcNow))
                .ToList();

            // Process line items and fetch prices if not provided
            var processedLines = new List<CreateInvoiceItemDto>();
            foreach (var line in dto.Lines)
            {
                var unitPrice = line.UnitPrice;

                // If UnitPrice not provided, fetch from PriceList
                if (!unitPrice.HasValue || unitPrice == 0)
                {
                    var itemPrice = priceListItemPrices.FirstOrDefault(ip => ip.ItemId == line.ItemId);
                    if (itemPrice == null)
                    {
                        throw new InvalidOperationException(
                            $"No active price found for item {line.ItemId} in {selectedPriceList.Name} price list");
                    }
                    unitPrice = itemPrice.Price;
                }

                processedLines.Add(new CreateInvoiceItemDto
                {
                    ItemId = line.ItemId,
                    Quantity = line.Quantity,
                    UnitPrice = unitPrice.Value
                });
            }

            var subtotal = processedLines.Sum(l => l.Quantity * (l.UnitPrice ?? 0));
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
                PriceListId = selectedPriceList.Id,
                SubTotal = subtotal,
                Tax = tax,
                Total = total,
                IsPaid = false
            };

            await _invoiceRepo.AddAsync(invoice);

            var lines = new List<InvoiceItem>();
            foreach (var l in processedLines)
            {
                var item = new InvoiceItem
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice ?? 0,
                    LineTotal = l.Quantity * (l.UnitPrice ?? 0)
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

            // Determine which PriceList to use (same logic as CreateAsync)
            PriceList? selectedPriceList = null;

            if (dto.PriceListId.HasValue)
            {
                selectedPriceList = await _priceListRepo.GetByIdAsync(dto.PriceListId.Value);
            }
            else
            {
                var allPriceLists = await _priceListRepo.GetAllAsync();
                selectedPriceList = allPriceLists.FirstOrDefault(p => p.IsDefault);
            }

            if (selectedPriceList == null)
                throw new InvalidOperationException("No valid price list found. Please select a price list or set a default.");

            // Fetch all item prices for the selected price list
            var allItemPrices = await _itemPriceRepo.GetAllAsync();
            var priceListItemPrices = allItemPrices
                .Where(ip => ip.PriceListId == selectedPriceList.Id &&
                           ip.EffectiveFrom <= DateTime.UtcNow &&
                           (ip.EffectiveTo == null || ip.EffectiveTo >= DateTime.UtcNow))
                .ToList();

            // Process line items and fetch prices if not provided
            var processedLines = new List<CreateInvoiceItemDto>();
            foreach (var line in dto.Lines)
            {
                var unitPrice = line.UnitPrice;

                // If UnitPrice not provided, fetch from PriceList
                if (!unitPrice.HasValue || unitPrice == 0)
                {
                    var itemPrice = priceListItemPrices.FirstOrDefault(ip => ip.ItemId == line.ItemId);
                    if (itemPrice == null)
                    {
                        throw new InvalidOperationException(
                            $"No active price found for item {line.ItemId} in {selectedPriceList.Name} price list");
                    }
                    unitPrice = itemPrice.Price;
                }

                processedLines.Add(new CreateInvoiceItemDto
                {
                    ItemId = line.ItemId,
                    Quantity = line.Quantity,
                    UnitPrice = unitPrice.Value
                });
            }

            var subtotal = processedLines.Sum(l => l.Quantity * l.UnitPrice.Value);
            var tax = subtotal * (dto.TaxRate / 100);
            var total = subtotal + tax;

            invoice.Reference = dto.Reference;
            invoice.PoNumber = dto.PoNumber;
            invoice.InvoiceDate = dto.InvoiceDate;
            invoice.DueDate = dto.DueDate;
            invoice.CustomerId = dto.CustomerId;
            invoice.BranchId = dto.BranchId;
            invoice.PriceListId = selectedPriceList.Id;
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
            foreach (var l in processedLines)
            {
                var item = new InvoiceItem
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice.Value,
                    LineTotal = l.Quantity * l.UnitPrice.Value
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
                PriceListId = i.PriceListId,
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
