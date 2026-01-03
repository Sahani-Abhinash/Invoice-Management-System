using IMS.Domain.Common;
using IMS.Domain.Enums;

namespace IMS.Domain.Entities.Transaction
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public IncomeExpenseType Type { get; set; }
        public bool IsSystemCategory { get; set; } // System categories like "GRN", "Invoice" cannot be deleted
    }
}
