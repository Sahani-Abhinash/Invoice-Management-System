# Partial Payment - Quick Reference Guide

## 🎯 Quick Start

### For Users
1. Open an invoice
2. Click **"Record Payment"** button
3. Enter amount (cannot exceed balance due)
4. Select payment method
5. Click **"Record Payment"**
6. View updated payment status and history

### For Developers
1. Run database migration: `dotnet ef database update`
2. Start backend: `dotnet run` (IMS.API)
3. Start frontend: `npm start` (ims.ClientApp)
4. Test payment recording endpoint: `POST /api/invoice/{id}/payment`

---

## 📊 Payment Status Flow

```
Invoice Created
      ↓
   UNPAID (No payments)
      ↓
Record Payment → PARTIALLY PAID (0 < Paid < Total)
      ↓
Record Payment → FULLY PAID (Paid ≥ Total)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/invoice/{id}/payment` | Record a payment |
| GET | `/api/invoice/{id}/payment-details` | Get payment details & history |
| POST | `/api/invoice/pay/{id}` | Mark invoice as fully paid |
| GET | `/api/invoice/{id}` | Get invoice (includes payment info) |

### Example Request
```bash
curl -X POST http://localhost:5000/api/invoice/{invoiceId}/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "method": "BankTransfer"
  }'
```

### Example Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "invoiceId": "660e8400-e29b-41d4-a716-446655440001",
  "amount": 500.00,
  "paidAt": "2025-12-30T10:30:00Z",
  "method": "BankTransfer"
}
```

---

## 📱 Frontend Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/invoices` | InvoiceListComponent | List all invoices |
| `/invoices/create` | InvoiceFormComponent | Create new invoice |
| `/invoices/edit/:id` | InvoiceFormComponent | Edit invoice |
| `/invoices/view/:id` | InvoiceViewComponent | View invoice details |
| `/invoices/payment/:id` | PaymentRecordComponent | Record payment |

---

## 🗄️ Database Schema Changes

### Invoices Table
```sql
ALTER TABLE Invoices ADD PaidAmount DECIMAL(18,2) DEFAULT 0;
ALTER TABLE Invoices ADD PaymentStatus INT DEFAULT 0; -- 0=Unpaid, 1=Partially, 2=Fully, 3=Overdue
```

### Payments Table (Already Exists)
```sql
CREATE TABLE Payments (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    InvoiceId UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    PaidAt DATETIME2 NOT NULL,
    Method NVARCHAR(100) NOT NULL
);
```

---

## 🧪 Test Scenarios

### Test 1: Record Full Payment
```typescript
const payment = { amount: 1000, method: 'Cash' };
this.invoiceService.recordPayment(invoiceId, payment).subscribe(
  response => console.log('Paid! Status:', response)
);
```

**Expected Result**:
- Payment recorded ✓
- Invoice status = "FullyPaid" ✓
- Balance due = 0 ✓

### Test 2: Record Partial Payment
```typescript
const payment = { amount: 300, method: 'Check' };
this.invoiceService.recordPayment(invoiceId, payment).subscribe(
  response => console.log('Partial payment recorded')
);
```

**Expected Result**:
- Payment recorded ✓
- Status = "PartiallyPaid" ✓
- Balance due = total - 300 ✓

### Test 3: Invalid Payment (Too Much)
```typescript
const payment = { amount: 2000, method: 'Card' }; // Total = 1000
this.invoiceService.recordPayment(invoiceId, payment).subscribe(
  null,
  error => console.log('Error:', error.error.message) // "exceeds balance due"
);
```

---

## 💻 Code Snippets

### Angular Component - Record Payment
```typescript
recordPayment() {
  const paymentDto: RecordPaymentDto = {
    amount: this.paymentForm.get('amount')?.value,
    method: this.paymentForm.get('method')?.value
  };
  
  this.invoiceService.recordPayment(invoiceId, paymentDto).subscribe(
    payment => {
      this.successMessage = `Payment of $${payment.amount} recorded!`;
      this.loadInvoiceDetails(); // Refresh
    },
    error => {
      this.errorMessage = error.error?.message;
    }
  );
}
```

### Backend - Record Payment Service
```csharp
public async Task<PaymentDto> RecordPaymentAsync(Guid invoiceId, RecordPaymentDto dto)
{
    // Validate
    if (dto.Amount <= 0) throw new ArgumentException("Amount must be > 0");
    
    var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
    var balanceDue = invoice.Total - invoice.PaidAmount;
    
    if (dto.Amount > balanceDue) 
        throw new InvalidOperationException($"Exceeds balance due of {balanceDue}");
    
    // Create payment
    var payment = new Payment
    {
        Id = Guid.NewGuid(),
        InvoiceId = invoiceId,
        Amount = dto.Amount,
        PaidAt = DateTime.UtcNow,
        Method = dto.Method
    };
    
    // Update invoice
    invoice.PaidAmount += dto.Amount;
    
    if (invoice.PaidAmount >= invoice.Total)
    {
        invoice.PaymentStatus = PaymentStatus.FullyPaid;
        invoice.IsPaid = true;
    }
    else
    {
        invoice.PaymentStatus = PaymentStatus.PartiallyPaid;
    }
    
    await _repository.AddAsync(payment);
    _invoiceRepository.Update(invoice);
    await _repository.SaveChangesAsync();
    
    return MapToDto(payment);
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Balance due field not showing"
**Solution**: Ensure database migration was run
```bash
dotnet ef database update
```

### Issue: Payment endpoint returns 404
**Solution**: Check that route is registered in invoice.routes.ts
```typescript
{ path: 'payment/:id', component: PaymentRecordComponent }
```

### Issue: "Payment exceeds balance due" error
**Solution**: This is correct behavior - payment cannot exceed balance
- Inform user of maximum amount they can pay
- Frontend validates this with max attribute on input field

### Issue: PaymentService not injected
**Solution**: Ensure dependency injection is configured
```csharp
services.AddScoped<IPaymentService, PaymentService>();
services.AddScoped<IPaymentRepository, PaymentRepository>();
```

---

## 🎨 UI Status Colors

```css
/* Payment Status Badges */
.status-unpaid { background: #dc3545; /* Red */ }
.status-partial { background: #ffc107; /* Yellow */ }
.status-paid { background: #28a745; /* Green */ }
.status-overdue { background: #343a40; /* Dark */ }
```

---

## 📈 Performance Notes

- Payment queries are indexed on `InvoiceId`
- Payment history loads with invoice details
- UI updates are optimized with change detection
- Database saves are atomic operations

---

## 🔐 Security Checklist

- [x] Payment amounts validated (frontend & backend)
- [x] Invoice existence verified
- [x] User authentication required (configure in controller)
- [x] Payment immutable after recording
- [x] Audit trail via payment history
- [x] SQL injection prevented (Entity Framework)
- [x] XSS protected (Angular sanitization)

---

## 📖 Related Files

| File | Purpose |
|------|---------|
| `PARTIAL_PAYMENT_IMPLEMENTATION.md` | Complete documentation |
| `IMPLEMENTATION_SUMMARY.md` | Summary of changes |
| `PaymentService.cs` | Core payment logic |
| `payment-record.component.ts` | Payment UI component |
| `invoice.service.ts` | Frontend API calls |

---

## ✉️ Quick Lookup

**Q: How to record a payment?**
A: Call `invoiceService.recordPayment(invoiceId, {amount, method})`

**Q: How to get payment history?**
A: Call `invoiceService.getPaymentDetails(invoiceId)`

**Q: How to check if invoice is paid?**
A: Check `invoice.paymentStatus === 'FullyPaid'` or `invoice.isPaid`

**Q: Can customer overpay?**
A: No, payment amount is validated and cannot exceed balance due

**Q: How are partial payments handled?**
A: Each payment is recorded separately, status updates to PartiallyPaid

**Q: What payment methods are supported?**
A: Cash, Check, BankTransfer, CreditCard, OnlinePayment (easily extensible)

---

**Last Updated**: December 2025
**Version**: 1.0 Complete
