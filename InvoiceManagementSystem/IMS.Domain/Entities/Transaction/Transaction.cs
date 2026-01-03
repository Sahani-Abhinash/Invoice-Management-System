using IMS.Domain.Common;
using IMS.Domain.Enums;
using System;

namespace IMS.Domain.Entities.Transaction
{
    public class Transaction : BaseEntity
    {
        public DateTime TransactionDate { get; set; }
        public TransactionType Type { get; set; } // Debit or Credit
        public decimal Amount { get; set; }
        public Guid CategoryId { get; set; } // Foreign key to Category
        public Category Category { get; set; } = null!; // Navigation property
        public string Description { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public string SourceType { get; set; } = string.Empty; // GRN, Invoice, Manual
        public string? SourceId { get; set; } // Link to source entity
        public Guid? CompanyId { get; set; }
    }
}
