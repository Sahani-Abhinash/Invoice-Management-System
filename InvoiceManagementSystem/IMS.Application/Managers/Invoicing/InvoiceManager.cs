using IMS.Application.DTOs.Invoicing;
using IMS.Application.Interfaces.Invoicing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Invoicing
{
    public class InvoiceManager : IInvoiceManager
    {
        private readonly IInvoiceService _service;
        private readonly IPaymentService _paymentService;

        public InvoiceManager(
            IInvoiceService service, 
            IPaymentService paymentService)
        {
            _service = service;
            _paymentService = paymentService;
        }

        public Task<IEnumerable<InvoiceDto>> GetAllAsync() => _service.GetAllAsync();
        public Task<InvoiceDto?> GetByIdAsync(Guid id) => _service.GetByIdAsync(id);
        
        public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto)
        {
            var invoice = await _service.CreateAsync(dto);
            return invoice;
        }
        
        public Task<InvoiceDto?> UpdateAsync(Guid id, CreateInvoiceDto dto) => _service.UpdateAsync(id, dto);
        public Task<bool> DeleteAsync(Guid id) => _service.DeleteAsync(id);
        public Task<bool> MarkAsPaidAsync(Guid id) => _service.MarkAsPaidAsync(id);
        
        public async Task<PaymentDto> RecordPaymentAsync(Guid invoiceId, RecordPaymentDto dto)
        {
            var payment = await _service.RecordPaymentAsync(invoiceId, dto);
            return payment;
        }
        
        public Task<InvoicePaymentDetailsDto> GetPaymentDetailsAsync(Guid invoiceId) => _service.GetPaymentDetailsAsync(invoiceId);
    }
}
