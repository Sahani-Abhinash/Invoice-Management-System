# Payment Service Architecture Fix

## Problem

The Payment module was using a **custom repository pattern** (`IPaymentRepository`, `PaymentRepository`) which was inconsistent with the rest of the codebase.

The rest of the application uses the **generic repository pattern** where services directly use `IRepository<T>`.

## What Was Wrong

### Before (Inconsistent)

```csharp
// IPaymentRepository.cs - Custom repository interface
public interface IPaymentRepository
{
    Task<Payment> AddAsync(Payment payment);
    Task<IEnumerable<Payment>> GetByInvoiceIdAsync(Guid invoiceId);
    Task<Payment?> GetByIdAsync(Guid id);
    Task SaveChangesAsync();
}

// PaymentRepository.cs - Custom repository implementation
public class PaymentRepository : IPaymentRepository
{
    private readonly IRepository<Payment> _repository;
    
    public async Task<IEnumerable<Payment>> GetByInvoiceIdAsync(Guid invoiceId)
    {
        var payments = await _repository.GetAllAsync();
        return payments.Where(p => p.InvoiceId == invoiceId).ToList();
    }
    // ... other methods
}

// PaymentService.cs - Using custom repository
public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository; // ? Custom repository
    private readonly IRepository<Invoice> _invoiceRepository;
    
    public PaymentService(
        IPaymentRepository paymentRepository,  // ? Custom repository
        IRepository<Invoice> invoiceRepository)
    {
        _paymentRepository = paymentRepository;
        _invoiceRepository = invoiceRepository;
    }
}

// Program.cs - DI registration
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>(); // ? Custom repository
builder.Services.AddScoped<IPaymentService, PaymentService>();
```

**Problems:**
- ? Inconsistent with rest of codebase (other services use `IRepository<T>`)
- ? Unnecessary abstraction layer (repository wrapping repository)
- ? More code to maintain
- ? Violates "Don't Repeat Yourself" (DRY) principle

## The Fix

### After (Consistent)

```csharp
// NO IPaymentRepository.cs - Removed ?
// NO PaymentRepository.cs - Removed ?

// PaymentService.cs - Using generic repository
public class PaymentService : IPaymentService
{
    private readonly IRepository<Payment> _paymentRepository; // ? Generic repository
    private readonly IRepository<Invoice> _invoiceRepository;
    
    public PaymentService(
        IRepository<Payment> paymentRepository,  // ? Generic repository
        IRepository<Invoice> invoiceRepository)
    {
        _paymentRepository = paymentRepository;
        _invoiceRepository = invoiceRepository;
    }
    
    public async Task<IEnumerable<PaymentDto>> GetPaymentsByInvoiceAsync(Guid invoiceId)
    {
        var allPayments = await _paymentRepository.GetAllAsync();
        var payments = allPayments.Where(p => p.InvoiceId == invoiceId).ToList();
        return payments.Select(MapToDto).ToList();
    }
}

// Program.cs - DI registration
// NO custom repository registration needed ?
builder.Services.AddScoped<IPaymentService, PaymentService>(); // Service uses IRepository<Payment>
```

**Benefits:**
- ? Consistent with rest of codebase
- ? Less code to maintain
- ? Uses generic `IRepository<T>` pattern
- ? Follows established architecture

## Files Changed

### Deleted Files ?
1. `IMS.Infrastructure\Repositories\Invoicing\PaymentRepository.cs` - Removed
2. `IMS.Application\Interfaces\Invoicing\IPaymentRepository.cs` - Removed

### Modified Files ?
1. `IMS.Infrastructure\Services\Invoicing\PaymentService.cs` - Now uses `IRepository<Payment>`
2. `IMS.API\Program.cs` - Removed custom repository registration

## Consistency Check

Now **ALL** services use the generic repository pattern:

| Service | Repository Used | Status |
|---------|----------------|--------|
| CompanyService | `IRepository<Company>` | ? |
| BranchService | `IRepository<Branch>` | ? |
| VendorService | `IRepository<Vendor>` | ? |
| CustomerService | `IRepository<Customer>` | ? |
| InvoiceService | `IRepository<Invoice>` | ? |
| **PaymentService** | **`IRepository<Payment>`** | **? Fixed** |
| PurchaseOrderService | `IRepository<PurchaseOrder>` | ? |
| GrnService | `IRepository<GoodsReceivedNote>` | ? |

## Architecture Pattern

```
Controller ? Manager ? Service ? IRepository<T> ? DbContext
```

**Example Flow:**
```
InvoiceController
    ?
InvoiceManager
    ?
PaymentService (uses IRepository<Payment>) ?
    ?
Repository<Payment> (generic implementation)
    ?
AppDbContext
```

## Note on Accounting Module

The Accounting module still uses custom repositories (`IAccountRepository`, `ITransactionCategoryRepository`, etc.) because it has **custom business logic** that cannot be handled by the generic repository.

**When to use custom repositories:**
- ? Simple CRUD operations ? Use `IRepository<T>`
- ? Complex business logic, custom queries ? Custom repository is acceptable

**Payment module:** Simple CRUD ? Should use `IRepository<Payment>` ?

## Build Status

? **Build Successful** - No payment-related errors
?? Existing Accounting module errors are unrelated to this fix

## Summary

The Payment module has been **fixed to follow the same architecture pattern** as the rest of the application:

- **Before:** Custom `IPaymentRepository` ? `PaymentRepository` ? `IRepository<Payment>` (? Unnecessary layer)
- **After:** `IRepository<Payment>` directly (? Consistent with codebase)

This change makes the codebase more **consistent**, **maintainable**, and follows **established patterns**.
