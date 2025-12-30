using IMS.Application.DTOs.Invoicing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Invoicing
{
    public interface IInvoiceService
    {
        Task<IEnumerable<InvoiceDto>> GetAllAsync();
        Task<InvoiceDto?> GetByIdAsync(Guid id);
        Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto);
        Task<InvoiceDto?> UpdateAsync(Guid id, CreateInvoiceDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> MarkAsPaidAsync(Guid id);
        Task<PaymentDto> RecordPaymentAsync(Guid invoiceId, RecordPaymentDto dto);
        Task<InvoicePaymentDetailsDto> GetPaymentDetailsAsync(Guid invoiceId);
        Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId);
    }
}
