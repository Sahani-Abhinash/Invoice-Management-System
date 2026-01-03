using IMS.Domain.Common;
using IMS.Domain.Enums;
using System;

namespace IMS.Domain.Entities.Purchase
{
    public class GrnPayment : BaseEntity
    {
        public Guid GrnId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
        public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
        public DateTime? DueDate { get; set; }

        // Navigation property
        public GoodsReceivedNote? GoodsReceivedNote { get; set; }
    }
}
