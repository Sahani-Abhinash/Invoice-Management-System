# Partial Payment Implementation for Invoice Management System

## Overview
This implementation adds comprehensive partial payment handling to the Invoice Management System. Users can now record multiple payments for a single invoice, track payment status, and view payment history.

## Features Implemented

### 1. **Domain Model Enhancements** (Backend)

#### Invoice Entity Updates
- Added `PaidAmount` field: Tracks total amount paid toward the invoice
- Added `PaymentStatus` enum property: Tracks payment state (Unpaid, PartiallyPaid, FullyPaid, Overdue)

#### New PaymentStatus Enum
```csharp
public enum PaymentStatus
{
    Unpaid = 0,
    PartiallyPaid = 1,
    FullyPaid = 2,
    Overdue = 3
}
```

#### Payment Entity
Already existed, but now fully integrated for partial payment support:
- `Id`: Unique identifier
- `InvoiceId`: Links to invoice
- `Amount`: Payment amount
- `PaidAt`: Timestamp
- `Method`: Payment method (Cash, Check, Bank Transfer, etc.)

---

## 2. **Data Transfer Objects (DTOs)** 

### PaymentDto
```csharp
public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaidAt { get; set; }
    public string Method { get; set; }
}
```

### RecordPaymentDto (Input)
```csharp
public class RecordPaymentDto
{
    public decimal Amount { get; set; }
    public string Method { get; set; }
}
```

### InvoicePaymentDetailsDto
```csharp
public class InvoicePaymentDetailsDto
{
    public Guid Id { get; set; }
    public string Reference { get; set; }
    public decimal Total { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceDue { get; set; }
    public string PaymentStatus { get; set; }
    public List<PaymentDto> Payments { get; set; }
}
```

### Enhanced InvoiceDto
- Added `PaidAmount` field
- Added `BalanceDue` computed property: `Total - PaidAmount`
- Added `PaymentStatus` field
- Added `Payments` collection

---

## 3. **Service Layer** (Backend)

### IPaymentService Interface
```csharp
public interface IPaymentService
{
    Task<PaymentDto> RecordPaymentAsync(Guid invoiceId, RecordPaymentDto dto);
    Task<IEnumerable<PaymentDto>> GetPaymentsByInvoiceAsync(Guid invoiceId);
    Task<InvoicePaymentDetailsDto> GetInvoicePaymentDetailsAsync(Guid invoiceId);
}
```

### PaymentService Implementation
- **RecordPaymentAsync**: 
  - Validates payment amount
  - Checks if payment doesn't exceed balance due
  - Updates invoice `PaidAmount`
  - Automatically sets payment status
  - Persists both payment record and invoice updates

- **GetPaymentsByInvoiceAsync**: Retrieves all payments for an invoice

- **GetInvoicePaymentDetailsAsync**: Returns comprehensive payment details with history

### IPaymentRepository
```csharp
public interface IPaymentRepository
{
    Task<Payment> AddAsync(Payment payment);
    Task<IEnumerable<Payment>> GetByInvoiceIdAsync(Guid invoiceId);
    Task SaveChangesAsync();
}
```

---

## 4. **API Endpoints** (Backend)

### New Endpoints in InvoiceController

**POST** `/api/invoice/{id}/payment`
- Records a payment for an invoice
- Request: `RecordPaymentDto` with amount and method
- Response: `PaymentDto` with payment details
- Error handling for invalid amounts or overpayment

**GET** `/api/invoice/{id}/payment-details`
- Retrieves full payment details for an invoice
- Response: `InvoicePaymentDetailsDto` with all payment history
- Includes total, paid amount, balance due, and status

**POST** `/api/invoice/pay/{id}` (Existing)
- Still available for marking invoice as fully paid in one action

---

## 5. **Frontend Service** (invoice.service.ts)

### New Interfaces
```typescript
export interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    paidAt: string;
    method: string;
}

export interface InvoicePaymentDetails {
    id: string;
    reference: string;
    total: number;
    paidAmount: number;
    balanceDue: number;
    paymentStatus: string;
    payments: Payment[];
}

export interface RecordPaymentDto {
    amount: number;
    method: string;
}
```

### New Service Methods
- `recordPayment(invoiceId, payment)`: Records a new payment
- `getPaymentDetails(invoiceId)`: Fetches payment details and history

### Enhanced Invoice Interface
- Added `paidAmount`
- Added `balanceDue` (computed)
- Added `paymentStatus`
- Added `payments` collection

---

## 6. **Payment Recording Component** (NEW)

### Location
`src/app/invoices/payment-record/`

### Files
1. **payment-record.component.ts**: Component logic
2. **payment-record.component.html**: UI template
3. **payment-record.component.css**: Styling

### Features
- View invoice summary with balance due
- Record new payment with validation
- Select payment method (Cash, Check, Bank Transfer, Credit Card, Online)
- Display payment history
- Real-time validation (max amount = balance due)
- Success/error notifications
- Automatic refresh after payment recording

### Payment Methods Supported
- Cash
- Check
- Bank Transfer
- Credit Card
- Online Payment

---

## 7. **Updated Invoice View Component**

### Enhancements
- Added "Record Payment" button (visible for unpaid invoices)
- Display payment status with color coding:
  - **Green**: Fully Paid
  - **Yellow**: Partially Paid
  - **Red**: Unpaid
  - **Dark**: Overdue
- Shows balance due prominently
- Displays paid amount in summary
- Payment history table showing date, amount, and method
- Navigate to payment recording screen

### View Calculations
- Balance Due = Total - Paid Amount
- Displayed in red for visibility

---

## 8. **Routing**

### New Route
```typescript
{ path: 'payment/:id', component: PaymentRecordComponent }
```

Access via: `/invoices/payment/{invoiceId}`

---

## 9. **Business Logic**

### Payment Recording Process
1. **Validation**:
   - Amount must be > 0
   - Amount must not exceed balance due
   - Invoice must exist

2. **Payment Recording**:
   - Create payment record with timestamp and method
   - Add payment to database
   - Update invoice `PaidAmount`
   - Automatically determine payment status:
     - If `PaidAmount >= Total`: Mark as `FullyPaid` and set `IsPaid = true`
     - If `0 < PaidAmount < Total`: Mark as `PartiallyPaid`
     - If `PaidAmount == 0`: Mark as `Unpaid`

3. **Persistence**:
   - Save payment record
   - Update invoice totals and status
   - All changes committed atomically

### Payment Status Logic
```csharp
if (invoice.PaidAmount >= invoice.Total)
{
    invoice.PaymentStatus = PaymentStatus.FullyPaid;
    invoice.IsPaid = true;
}
else if (invoice.PaidAmount > 0)
{
    invoice.PaymentStatus = PaymentStatus.PartiallyPaid;
}
// else remains Unpaid
```

---

## 10. **Usage Examples**

### Recording a Partial Payment
```typescript
// Frontend
const payment: RecordPaymentDto = {
    amount: 500,
    method: 'BankTransfer'
};

this.invoiceService.recordPayment(invoiceId, payment).subscribe(
    result => console.log('Payment recorded:', result),
    error => console.error('Payment failed:', error)
);
```

### Getting Payment Details
```typescript
this.invoiceService.getPaymentDetails(invoiceId).subscribe(
    details => {
        console.log('Balance Due:', details.balanceDue);
        console.log('Payment Status:', details.paymentStatus);
        console.log('Payment History:', details.payments);
    }
);
```

### API Call (Direct)
```bash
# Record Payment
POST /api/invoice/{invoiceId}/payment
Content-Type: application/json
{
    "amount": 500.00,
    "method": "BankTransfer"
}

# Get Payment Details
GET /api/invoice/{invoiceId}/payment-details
```

---

## 11. **Database Changes Required**

Run Entity Framework migrations to add:
- `PaidAmount` field to `Invoices` table
- `PaymentStatus` field to `Invoices` table

Migration commands:
```bash
cd IMS.Infrastructure
dotnet ef migrations add AddPartialPaymentSupport
dotnet ef database update
```

---

## 12. **Error Handling**

### Backend Validation
- **ArgumentException**: If payment amount ≤ 0 or exceeds balance due
- **InvalidOperationException**: If invoice not found
- Returns appropriate HTTP status codes:
  - 400 Bad Request: Invalid payment amount
  - 404 Not Found: Invoice not found
  - 200 OK: Payment recorded successfully

### Frontend Handling
- Form validation (amount must be positive, ≤ balance due)
- Error messages displayed to user
- Loading states during API calls
- Success notifications after payment recording

---

## 13. **Security Considerations**

1. **Authorization**: Ensure API endpoints are protected with authentication
2. **Validation**: All payment amounts validated both frontend and backend
3. **Audit Trail**: Payment history provides complete transaction record
4. **Atomicity**: Payment and invoice updates are atomic operations

---

## 14. **Testing Checklist**

- [ ] Record full payment (balance due becomes 0)
- [ ] Record partial payment (balance due decreases)
- [ ] Attempt payment exceeding balance due (error)
- [ ] Attempt negative payment (error)
- [ ] Record multiple payments on same invoice
- [ ] Verify payment status updates correctly
- [ ] View payment history
- [ ] Verify invoice status reflects payment state
- [ ] Print invoice with payment information
- [ ] Navigate back from payment screen

---

## 15. **Future Enhancements**

- Payment reminders for overdue invoices
- Automatic payment status based on due date
- Payment plan support
- Refund/reversal of payments
- Payment reports and analytics
- Integration with payment gateways
- Automated payment processing
- Payment receipts generation

---

## Summary

The partial payment system provides:
✅ Multiple payments per invoice
✅ Real-time payment status tracking
✅ Complete payment history
✅ Validation and error handling
✅ User-friendly UI with payment recording
✅ Enhanced invoice view with payment details
✅ Automatic status management
✅ Secure and atomic operations
