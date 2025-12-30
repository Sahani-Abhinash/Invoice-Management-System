using IMS.Domain.Common;
using IMS.Domain.Enums;
using System;

namespace IMS.Domain.Entities.Accounting
{
    public class TransactionCategory : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public IncomeExpenseType Type { get; set; }
        public Guid GlAccountId { get; set; }
        public bool IsActive { get; set; } = true;

        public Account GlAccount { get; set; } = null!;
    }
}
