using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Invoicing
{
    public class CreateInvoiceItemDto
    {
        public Guid ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class CreateInvoiceDto
    {
        public string Reference { get; set; } = string.Empty;
        public string? PoNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? BranchId { get; set; }
        public decimal TaxRate { get; set; }
        public List<CreateInvoiceItemDto> Lines { get; set; } = new List<CreateInvoiceItemDto>();
    }
}
