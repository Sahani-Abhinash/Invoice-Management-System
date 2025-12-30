using System;
using IMS.Domain.Enums;

namespace IMS.Application.DTOs.Accounting
{
    public class IncomeExpenseTransactionDto
    {
        public Guid Id { get; set; }
        public IncomeExpenseType Type { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public Guid? AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime TransactionDate { get; set; }
        public string Reference { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SourceModule { get; set; } = "Manual";
        public string? SourceId { get; set; }
        public string Status { get; set; } = "Draft";
    }

    public class CreateIncomeExpenseTransactionDto
    {
        public IncomeExpenseType Type { get; set; }
        public Guid CategoryId { get; set; }
        public Guid? AccountId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime TransactionDate { get; set; }
        public string Reference { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SourceModule { get; set; } = "Manual";
        public string? SourceId { get; set; }
        public bool PostNow { get; set; } = false;
    }
}
