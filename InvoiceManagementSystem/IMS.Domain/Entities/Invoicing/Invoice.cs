using IMS.Domain.Common;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;

namespace IMS.Domain.Entities.Invoicing
{
    public class Invoice : BaseEntity
    {
        public string Reference { get; set; } = string.Empty;
        public string? PoNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public Guid? CustomerId { get; set; }
        // Optional link to branch/company depending on your model
        public Guid? BranchId { get; set; }
        public Guid? PriceListId { get; set; }

        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public decimal PaidAmount { get; set; } = 0;
        public bool IsPaid { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

        public ICollection<InvoiceItem> Lines { get; set; } = new List<InvoiceItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}