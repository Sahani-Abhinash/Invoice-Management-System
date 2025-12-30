namespace IMS.Domain.Enums
{
    public enum TransactionType
    {
        InvoiceCreated = 1,
        PaymentReceived = 2,
        PurchaseOrderCreated = 3,
        GoodsReceived = 4,
        PaymentMade = 5,
        Adjustment = 7,
        Opening = 8,
        Closing = 9
    }
}
