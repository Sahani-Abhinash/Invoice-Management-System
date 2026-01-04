using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Invoicing
{
    public class InvoiceItemDto
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    public class InvoiceDto
    {
        public Guid Id { get; set; }
        public string Reference { get; set; } = string.Empty;
        public string? PoNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid? PriceListId { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceDue => Total - PaidAmount;
        public bool IsPaid { get; set; }
        public string PaymentStatus { get; set; } = "Unpaid";
        public List<InvoiceItemDto> Lines { get; set; } = new List<InvoiceItemDto>();
        public List<PaymentDto> Payments { get; set; } = new List<PaymentDto>();
    }
}

