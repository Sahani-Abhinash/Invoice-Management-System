using System;
using IMS.Domain.Enums;

namespace IMS.Application.DTOs.Accounting
{
    public class IncomeExpenseCategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public IncomeExpenseType Type { get; set; }
        public Guid GlAccountId { get; set; }
        public string GlAccountName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class CreateIncomeExpenseCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public IncomeExpenseType Type { get; set; }
        public Guid GlAccountId { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
