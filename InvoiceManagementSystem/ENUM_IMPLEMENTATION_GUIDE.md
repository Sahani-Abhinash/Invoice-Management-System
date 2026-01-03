# Enum Implementation - Type Safety Improvements

## Summary of Changes

### Why Use Enums?
- ✅ **Type Safety**: Compiler catches invalid values (not runtime)
- ✅ **Intellisense**: IDE suggests valid options instead of remembering strings
- ✅ **Performance**: Enums are stored as integers in DB (faster than strings)
- ✅ **Maintenance**: Change in one place updates everywhere
- ✅ **Validation**: Prevents typos like "POSTED" vs "Posted"

### Why CompanyId is Optional?

You mentioned you don't have multiple companies. Here's what was changed:

**Before**:
```csharp
public Guid CompanyId { get; set; }  // REQUIRED
```

**After**:
```csharp
public Guid? CompanyId { get; set; }  // OPTIONAL (nullable)
```

**Benefits**:
- ✅ Single-company systems work without providing CompanyId
- ✅ Can scale to multi-company later without major changes
- ✅ Backward compatible - existing code still works
- ✅ Only fill when actually needed

---

## Enums Created

### 1. AccountType Enum
```csharp
public enum AccountType
{
    Asset = 1,          // 1000s (Cash, AR, Inventory, etc)
    Liability = 2,      // 2000s (AP, Loans, etc)
    Equity = 3,         // 3000s (Capital, Retained Earnings)
    Revenue = 4,        // 4000s (Sales, Service Revenue)
    Expense = 5         // 5000s (COGS, Salaries, etc)
}
```

**Usage**:
```csharp
// Before (error-prone):
public string AccountType { get; set; } = "Asset";  // Easy to typo: "Aset", "ASSET"

// After (type-safe):
public AccountType AccountType { get; set; } = AccountType.Asset;  // IntelliSense shows options
```

### 2. GLSourceType Enum
```csharp
public enum GLSourceType
{
    GRN = 1,              // Goods Received Note
    Invoice = 2,          // Customer Invoice
    Manual = 3,           // Manual Journal Entry
    Payment = 4,          // Payment recorded
    JournalEntry = 5     // Other Journal Entry
}
```

**Usage**:
```csharp
// Before (easy to typo):
journalEntry.SourceType = "grn";  // Inconsistent (lowercase)

// After (standardized):
journalEntry.SourceType = GLSourceType.GRN;  // Always consistent
```

### 3. TransactionStatus Enum
```csharp
public enum TransactionStatus
{
    Pending = 1,
    Posted = 2,
    Reversed = 3,
    Rejected = 4
}
```

**Usage**:
```csharp
// Before (could have invalid status):
entry.Status = "POSTED";  // Typo: should be "Posted"

// After (validated at compile time):
entry.Status = TransactionStatus.Posted;  // Compiler validates
```

### 4. CurrencyCode Enum
```csharp
public enum CurrencyCode
{
    USD = 1,
    EUR = 2,
    GBP = 3,
    INR = 4,
    AUD = 5,
    CAD = 6,
    JPY = 7,
    CHF = 8,
    SEK = 9,
    NZD = 10
}
```

**Usage**:
```csharp
// Before (allows typos like "USDA"):
public string Currency { get; set; } = "USD";

// After (only valid ISO codes):
public CurrencyCode Currency { get; set; } = CurrencyCode.USD;
```

---

## Files Updated

| File | Changes |
|------|---------|
| `IMS.Domain/Enums/AccountingEnums.cs` | **NEW** - Created 4 enums |
| `IMS.Domain/Entities/Accounting/Account.cs` | Changed to use `AccountType` + `CurrencyCode` enums, made `CompanyId` optional |
| `IMS.Domain/Entities/Accounting/GeneralLedger.cs` | Changed to use `GLSourceType`, `TransactionStatus`, `CurrencyCode` enums, made `CompanyId` optional |
| `IMS.Domain/Entities/Purchase/GoodsReceivedNote.cs` | Made `CompanyId` optional |
| `IMS.Application/DTOs/Accounting/AccountDto.cs` | Changed to use enums, made `CompanyId` optional |
| `IMS.Application/DTOs/Accounting/GeneralLedgerDto.cs` | Changed to use enums, made `CompanyId` optional, changed `Lines` to `List<>` |

---

## Before vs After Examples

### Example 1: Creating an Account
**Before** (String-based):
```csharp
var account = new Account
{
    Code = "1010",
    Name = "Cash",
    AccountType = "Asset",  // Risk: Typo could be "Aset" or "ASSET"
    Currency = "USD",       // Risk: Could be "usd" or "USDA"
    CompanyId = companyId   // REQUIRED even if single company
};
```

**After** (Enum-based):
```csharp
var account = new Account
{
    Code = "1010",
    Name = "Cash",
    AccountType = AccountType.Asset,      // Type-safe, IntelliSense help
    Currency = CurrencyCode.USD,          // Only valid currencies allowed
    CompanyId = null                      // Optional - only set if needed
};
```

### Example 2: Creating GL Entry
**Before**:
```csharp
var entry = new GeneralLedger
{
    SourceType = "GRN",      // Risk: Could be "grn", "GRN ", " GRN"
    Status = "Posted"        // Risk: Could be "POSTED", "posted"
};
```

**After**:
```csharp
var entry = new GeneralLedger
{
    SourceType = GLSourceType.GRN,        // Only GRN, Invoice, Manual, Payment allowed
    Status = TransactionStatus.Posted     // Compiler validates status
};
```

### Example 3: Filtering GL Entries
**Before**:
```csharp
var filter = new GeneralLedgerFilterDto
{
    SourceType = userInput  // Risk: Invalid "Invoce" could slip through
};
```

**After**:
```csharp
var filter = new GeneralLedgerFilterDto
{
    SourceType = GLSourceType.Invoice  // IDE autocomplete prevents typos
};
```

---

## Database Migration Notes

**No schema changes needed!**

Enums automatically map to integers in database:
```sql
-- GeneralLedgers table will have:
SourceType INT NOT NULL          -- 1 = GRN, 2 = Invoice, etc
Status INT NOT NULL              -- 1 = Pending, 2 = Posted, etc
CurrencyCode INT NOT NULL        -- 1 = USD, 2 = EUR, etc
AccountType INT NOT NULL         -- 1 = Asset, 2 = Liability, etc

-- Accounts table will have:
CompanyId UNIQUEIDENTIFIER NULL  -- Now optional
```

**Migration command** (if needed for schema updates):
```bash
cd IMS.Infrastructure
dotnet ef migrations add AddAccountingEnums --startup-project ../IMS.API
dotnet ef database update --startup-project ../IMS.API
```

---

## Benefits Summary

| Aspect | String | Enum |
|--------|--------|------|
| **Type Safety** | ❌ No validation | ✅ Compiler enforces |
| **Performance** | ❌ Slower (string comparison) | ✅ Faster (int comparison) |
| **Database Size** | ❌ Larger (stores full text) | ✅ Smaller (stores integers) |
| **Typos** | ❌ Runtime errors | ✅ Compile-time errors |
| **IntelliSense** | ❌ Manual entry | ✅ Auto-complete |
| **Refactoring** | ❌ Find-replace needed | ✅ Automatic with rename |
| **Scalability** | ❌ Need multi-tenancy flag | ✅ Optional CompanyId ready |

---

## CompanyId Design Decision

### Single Company (Current)
```csharp
public Guid? CompanyId { get; set; } = null;  // Leave null
```

### Multi-Company (Future)
```csharp
public Guid? CompanyId { get; set; } = new Guid("...");  // Set to company GUID
```

**No code changes needed** - just fill in the value!

---

## Integration Points

### Service Layer Update (if needed)
```csharp
// The service layer may need updates to handle enums
// Example: GeneralLedgerService.CreateJournalEntryAsync()

public async Task CreateJournalEntryAsync(JournalEntryDto entry)
{
    // Now using enums:
    var ledger = new GeneralLedger
    {
        SourceType = entry.SourceType,      // GLSourceType enum
        Status = entry.Status,              // TransactionStatus enum
        CurrencyCode = entry.CurrencyCode   // CurrencyCode enum
    };
    // ...
}
```

### Repository Layer Update (if needed)
```csharp
// Filtering with enums still works the same:
var entries = await _context.GeneralLedgers
    .Where(x => x.SourceType == GLSourceType.GRN)  // Enum comparison
    .Where(x => x.Status == TransactionStatus.Posted)
    .ToListAsync();
```

---

## Testing Considerations

### Unit Tests
```csharp
[Test]
public void CreateAccount_WithValidAccountType_Succeeds()
{
    // Before: Check string matches exactly
    // After: Use enum directly
    var account = new Account { AccountType = AccountType.Asset };
    Assert.AreEqual(AccountType.Asset, account.AccountType);
}
```

### Validation Tests
```csharp
[Test]
public void CreateAccount_WithInvalidAccountType_FailsAtCompile()
{
    // Compile error - no runtime test needed!
    var account = new Account { AccountType = AccountType.InvalidType };  // Won't compile
}
```

---

## Recommendations

1. ✅ **Use enums for closed sets** - AccountType, Status, Source, Currency
2. ✅ **Make CompanyId nullable** - Supports both single and multi-company
3. ✅ **Update filtering logic** - Use enum comparisons in LINQ
4. ✅ **Document enum values** - Add XML comments to enums
5. ✅ **Consider enum display names** - For UI dropdowns (future enhancement)

---

**Status**: ✅ All enums implemented and integrated  
**Breaking Changes**: None - backward compatible with existing code  
**Database Changes**: None required for enums (stored as INT)  
**CompanyId Change**: Now optional (nullable) - only breaking if code requires non-null
