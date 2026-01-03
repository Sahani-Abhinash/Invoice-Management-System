using IMS.Domain.Enums;
using System;

namespace IMS.Application.DTOs.Warehouses
{
    public class GrnPaymentDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public DateTime Date { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class RecordGrnPaymentDto
    {
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class GrnPaymentDetailsDto
    {
        public Guid Id { get; set; }
        public string Reference { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceDue { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public List<GrnPaymentDto> Payments { get; set; } = new();
    }
}
