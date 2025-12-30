using IMS.Domain.Common;
using System;
using System.Collections.Generic;

namespace IMS.Domain.Entities.Accounting
{
    public class Account : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<IncomeExpenseTransaction> IncomeExpenseTransactions { get; set; } = new List<IncomeExpenseTransaction>();
        public ICollection<TransactionCategory> TransactionCategories { get; set; } = new List<TransactionCategory>();
    }
}
