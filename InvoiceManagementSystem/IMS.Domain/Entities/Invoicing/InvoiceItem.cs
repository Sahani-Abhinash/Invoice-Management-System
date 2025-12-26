using IMS.Domain.Common;
using System;

namespace IMS.Domain.Entities.Invoicing
{
    public class InvoiceItem : BaseEntity
    {
        public Guid InvoiceId { get; set; }
        public Guid ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }
}