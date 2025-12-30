using IMS.Application.DTOs.Invoicing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Invoicing
{
    public interface IPaymentService
    {
        Task<PaymentDto> RecordPaymentAsync(Guid invoiceId, RecordPaymentDto dto);
        Task<IEnumerable<PaymentDto>> GetPaymentsByInvoiceAsync(Guid invoiceId);
        Task<InvoicePaymentDetailsDto> GetInvoicePaymentDetailsAsync(Guid invoiceId);
        Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId);
    }
}
