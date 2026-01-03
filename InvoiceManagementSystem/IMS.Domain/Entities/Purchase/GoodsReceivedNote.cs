using IMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;

namespace IMS.Domain.Entities.Purchase
{
    public class GoodsReceivedNote : BaseEntity
    {
        public Guid? CompanyId { get; set; }  // Optional if single-company system
        // Link to originating purchase order (REQUIRED)
        public Guid PurchaseOrderId { get; set; }
        public DateTime ReceivedDate { get; set; }
        public string Reference { get; set; } = string.Empty;
        public bool IsReceived { get; set; }

        public ICollection<GoodsReceivedNoteLine> Lines { get; set; } = new List<GoodsReceivedNoteLine>();
        public ICollection<GrnPayment> Payments { get; set; } = new List<GrnPayment>();

        // Computed property for payment status
        public string PaymentStatus
        {
            get
            {
                var total = Lines.Sum(l => l.Quantity * l.UnitPrice);
                var paid = Payments.Sum(p => p.Amount);

                if (paid <= 0) return "Unpaid";
                if (paid >= total) return "FullyPaid";
                return "PartiallyPaid";
            }
        }
    }
}

