using IMS.Domain.Common;
using System;

namespace IMS.Domain.Entities.Invoicing
{
    public class Payment : BaseEntity
    {
        public Guid InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaidAt { get; set; }
        public string Method { get; set; } = string.Empty;
    }
}