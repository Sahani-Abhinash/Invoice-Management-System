using System;

namespace IMS.Domain.Enums
{
    /// <summary>
    /// Source of GL transaction for audit trail
    /// </summary>
    public enum GLSourceType
    {
        GRN = 1,
        Invoice = 2,
        Manual = 3,
        Payment = 4,
        JournalEntry = 5
    }

    /// <summary>
    /// Status of GL transaction
    /// </summary>
    public enum TransactionStatus
    {
        Pending = 1,
        Posted = 2,
        Reversed = 3,
        Rejected = 4
    }
}
