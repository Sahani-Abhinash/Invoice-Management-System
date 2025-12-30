using IMS.Domain.Common;
using IMS.Domain.Enums;
using System;

namespace IMS.Domain.Entities.Accounting
{
    public class IncomeExpenseTransaction : BaseEntity
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
        public string Status { get; set; } = "Draft"; // Draft, Posted

        public TransactionCategory Category { get; set; } = null!;
        public Account? Account { get; set; }
    }
}
