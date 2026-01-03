using IMS.Application.DTOs.Invoicing;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Invoicing;
using IMS.Application.Interfaces.Transaction;
using IMS.Domain.Entities.Invoicing;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Invoicing
{
    public class PaymentService : IPaymentService
    {
        private readonly IRepository<Payment> _paymentRepository;
        private readonly IRepository<Invoice> _invoiceRepository;
        private readonly ITransactionService? _transactionService;

        public PaymentService(
            IRepository<Payment> paymentRepository,
            IRepository<Invoice> invoiceRepository,
            ITransactionService? transactionService = null)
        {
            _paymentRepository = paymentRepository;
            _invoiceRepository = invoiceRepository;
            _transactionService = transactionService;
        }

        public async Task<PaymentDto> RecordPaymentAsync(Guid invoiceId, RecordPaymentDto dto)
        {
            // Validate input
            if (dto.Amount <= 0)
                throw new ArgumentException("Payment amount must be greater than zero");

            // Get invoice
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null)
                throw new InvalidOperationException("Invoice not found");

            // Check if payment exceeds balance due
            var balanceDue = invoice.Total - invoice.PaidAmount;
            if (dto.Amount > balanceDue)
                throw new InvalidOperationException($"Payment amount exceeds balance due of {balanceDue}");

            // Create payment record
            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                InvoiceId = invoiceId,
                Amount = dto.Amount,
                PaidAt = DateTime.UtcNow,
                Method = dto.Method
            };

            await _paymentRepository.AddAsync(payment);

            // Update invoice with paid amount
            invoice.PaidAmount += dto.Amount;

            // Update invoice payment status
            if (invoice.PaidAmount >= invoice.Total)
            {
                invoice.PaymentStatus = PaymentStatus.FullyPaid;
                invoice.IsPaid = true;
            }
            else if (invoice.PaidAmount > 0)
            {
                invoice.PaymentStatus = PaymentStatus.PartiallyPaid;
            }

            _invoiceRepository.Update(invoice);
            await _paymentRepository.SaveChangesAsync();
            await _invoiceRepository.SaveChangesAsync();

            // Record transaction on payment (cash inflow)
            if (_transactionService != null)
            {
                var methodName = dto.Method.ToString();
                await _transactionService.CreateFromSourceAsync(
                    payment.Id,
                    "Invoice_Payment",
                    TransactionType.Credit,
                    dto.Amount,
                    "Payment",
                    $"Payment received for invoice {invoice.Reference} via {methodName}"
                );
            }

            return MapToDto(payment);
        }

        public async Task<IEnumerable<PaymentDto>> GetPaymentsByInvoiceAsync(Guid invoiceId)
        {
            var allPayments = await _paymentRepository.GetAllAsync();
            var payments = allPayments.Where(p => p.InvoiceId == invoiceId).ToList();
            return payments.Select(MapToDto).ToList();
        }

        public async Task<InvoicePaymentDetailsDto> GetInvoicePaymentDetailsAsync(Guid invoiceId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null)
                throw new InvalidOperationException("Invoice not found");

            var allPayments = await _paymentRepository.GetAllAsync();
            var payments = allPayments.Where(p => p.InvoiceId == invoiceId).ToList();

            return new InvoicePaymentDetailsDto
            {
                Id = invoice.Id,
                Reference = invoice.Reference,
                Total = invoice.Total,
                PaidAmount = invoice.PaidAmount,
                BalanceDue = invoice.Total - invoice.PaidAmount,
                PaymentStatus = invoice.PaymentStatus.ToString(),
                Payments = payments.Select(MapToDto).ToList()
            };
        }

        private PaymentDto MapToDto(Payment payment)
        {
            return new PaymentDto
            {
                Id = payment.Id,
                InvoiceId = payment.InvoiceId,
                Amount = payment.Amount,
                PaidAt = payment.PaidAt,
                Method = payment.Method
            };
        }

        public async Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId)
        {
            var payment = await _paymentRepository.GetByIdAsync(paymentId);
            if (payment == null)
                return null;

            return MapToDto(payment);
        }
    }
}
