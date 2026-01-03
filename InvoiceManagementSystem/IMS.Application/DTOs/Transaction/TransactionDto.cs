using System;
using IMS.Domain.Enums;

namespace IMS.Application.DTOs.Transaction
{
    public class TransactionDto
    {
        public Guid Id { get; set; }
        public DateTime TransactionDate { get; set; }
        public TransactionType Type { get; set; }
        public string TypeName => Type.ToString();
        public decimal Amount { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public string SourceType { get; set; } = string.Empty;
        public string? SourceId { get; set; }
        public Guid? CompanyId { get; set; }
    }

    public class CreateTransactionDto
    {
        public DateTime TransactionDate { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public Guid CategoryId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public Guid? CompanyId { get; set; }
    }

    public class TransactionSummaryDto
    {
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal Balance => TotalCredits - TotalDebits;
        public int TotalTransactions { get; set; }
    }
}
