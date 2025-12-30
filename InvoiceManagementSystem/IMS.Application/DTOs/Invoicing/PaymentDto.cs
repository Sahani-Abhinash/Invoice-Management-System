using System;
using IMS.Domain.Enums;

namespace IMS.Application.DTOs.Invoicing
{
    public class PaymentDto
    {
        public Guid Id { get; set; }
        public Guid InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaidAt { get; set; }
        public PaymentMethod Method { get; set; } = PaymentMethod.Other;
    }

    public class RecordPaymentDto
    {
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; } = PaymentMethod.Other;
    }

    public class InvoicePaymentDetailsDto
    {
        public Guid Id { get; set; }
        public string Reference { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceDue { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public List<PaymentDto> Payments { get; set; } = new List<PaymentDto>();
    }
}
