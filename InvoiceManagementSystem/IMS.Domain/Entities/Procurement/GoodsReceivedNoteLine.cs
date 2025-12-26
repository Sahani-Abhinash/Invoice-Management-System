using IMS.Domain.Common;
using System;

namespace IMS.Domain.Entities.Procurement
{
    public class GoodsReceivedNoteLine : BaseEntity
    {
        public Guid GoodsReceivedNoteId { get; set; }
        public Guid ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
