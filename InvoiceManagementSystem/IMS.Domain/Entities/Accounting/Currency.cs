using IMS.Domain.Common;

namespace IMS.Domain.Entities.Accounting
{
    public class Currency : BaseEntity
    {
        public string Code { get; set; } = string.Empty; // e.g., USD, EUR, GBP
        public string Name { get; set; } = string.Empty; // e.g., US Dollar, Euro
        public string Symbol { get; set; } = string.Empty; // e.g., $, €, £
        public bool IsActive { get; set; } = true;
    }
}
