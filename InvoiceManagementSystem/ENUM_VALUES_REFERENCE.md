# Enum Values Quick Reference

## AccountType Enum

```csharp
public enum AccountType
{
    Asset = 1,          // 1000-1999 (Cash, AR, Inventory, Fixed Assets)
    Liability = 2,      // 2000-2999 (AP, Loans, Current Liabilities)
    Equity = 3,         // 3000-3999 (Capital, Retained Earnings)
    Revenue = 4,        // 4000-4999 (Sales, Service Revenue)
    Expense = 5         // 5000-5999 (COGS, Salary, Rent, Utilities)
}
```

### Usage Examples:
```csharp
// Create an Asset account
var account = new Account { AccountType = AccountType.Asset };

// Filter by expense accounts
var expenses = accounts.Where(a => a.AccountType == AccountType.Expense);

// DTO usage
var dto = new AccountDto { AccountType = AccountType.Revenue };
```

---

## GLSourceType Enum

```csharp
public enum GLSourceType
{
    GRN = 1,              // Goods Received Note (Inventory purchase)
    Invoice = 2,          // Customer Invoice (Sales)
    Manual = 3,           // Manual Journal Entry (User-created)
    Payment = 4,          // Payment recorded (Receives or Pays)
    JournalEntry = 5      // Other Journal Entry (Adjustments, etc)
}
```

### Usage Examples:
```csharp
// Auto-GL from GRN
var entry = new GeneralLedger { SourceType = GLSourceType.GRN };

// Filter by invoice source
var invoiceEntries = ledgers.Where(l => l.SourceType == GLSourceType.Invoice);

// Find all manual entries
var manualEntries = ledgers.Where(l => l.SourceType == GLSourceType.Manual);
```

---

## TransactionStatus Enum

```csharp
public enum TransactionStatus
{
    Pending = 1,    // Created but not finalized
    Posted = 2,     // Final, can be used in reports (default)
    Reversed = 3,   // Original entry reversed with reversal entry
    Rejected = 4    // Rejected/invalidated entry
}
```

### Usage Examples:
```csharp
// Default status for new entries
var entry = new GeneralLedger { Status = TransactionStatus.Posted };

// Filter for reporting
var postedEntries = ledgers.Where(l => l.Status == TransactionStatus.Posted);

// Check if can be reversed
if (entry.Status == TransactionStatus.Posted) {
    // Allow reversal
}
```

### Status Lifecycle:
```
Pending → Posted → Reversed
           ↓
         Rejected
```

---

## CurrencyCode Enum

```csharp
public enum CurrencyCode
{
    USD = 1,    // US Dollar ($)
    EUR = 2,    // Euro (€)
    GBP = 3,    // British Pound (£)
    INR = 4,    // Indian Rupee (₹)
    AUD = 5,    // Australian Dollar (A$)
    CAD = 6,    // Canadian Dollar (C$)
    JPY = 7,    // Japanese Yen (¥)
    CHF = 8,    // Swiss Franc (CHF)
    SEK = 9,    // Swedish Krona (kr)
    NZD = 10    // New Zealand Dollar (NZ$)
}
```

### Usage Examples:
```csharp
// Default currency
var account = new Account { Currency = CurrencyCode.USD };

// Multi-currency support
public class GeneralLedger {
    public CurrencyCode CurrencyCode { get; set; }  // Track per transaction
}

// Convert currency (future feature)
decimal usdAmount = amount;
if (transaction.CurrencyCode == CurrencyCode.EUR) {
    usdAmount = amount * exchangeRate;
}
```

---

## Database Values Reference

### In SQL Server, Enums Store as INT

```sql
-- AccountType table in database
1 = Asset
2 = Liability
3 = Equity
4 = Revenue
5 = Expense

-- Example query
SELECT * FROM Accounts WHERE AccountType = 1;  -- Returns all Asset accounts

-- Example insert
INSERT INTO Accounts (Code, Name, AccountType) VALUES ('1010', 'Cash', 1);
```

### View as Human-Readable
```sql
-- Use CASE statement for readability
SELECT 
    Code,
    Name,
    CASE AccountType
        WHEN 1 THEN 'Asset'
        WHEN 2 THEN 'Liability'
        WHEN 3 THEN 'Equity'
        WHEN 4 THEN 'Revenue'
        WHEN 5 THEN 'Expense'
    END AS AccountTypeText
FROM Accounts
```

---

## Common Enum Combinations

### Creating an Asset Purchase (GRN)
```csharp
// GL Entry for inventory receipt:
// Debit Inventory (Asset), Credit AP (Liability)

var debitLine = new JournalEntryLineDto
{
    AccountId = inventoryAccountId,  // AccountType = Asset
    DebitAmount = 1000m,
    CreditAmount = 0
};

var creditLine = new JournalEntryLineDto
{
    AccountId = payableAccountId,    // AccountType = Liability
    DebitAmount = 0,
    CreditAmount = 1000m
};

var journalEntry = new JournalEntryDto
{
    SourceType = GLSourceType.GRN,   // From GRN
    Status = TransactionStatus.Posted,
    Lines = new[] { debitLine, creditLine }
};
```

### Creating a Sales Transaction (Invoice)
```csharp
// GL Entry for sales:
// Debit AR (Asset), Credit Revenue (Revenue)

var debitLine = new JournalEntryLineDto
{
    AccountId = arAccountId,         // AccountType = Asset
    DebitAmount = 1000m,
    CreditAmount = 0
};

var creditLine = new JournalEntryLineDto
{
    AccountId = revenueAccountId,    // AccountType = Revenue
    DebitAmount = 0,
    CreditAmount = 1000m
};

var journalEntry = new JournalEntryDto
{
    SourceType = GLSourceType.Invoice,  // From Invoice
    Status = TransactionStatus.Posted,
    Lines = new[] { debitLine, creditLine }
};
```

### Creating a Manual Entry
```csharp
// User manually creates adjustment entry
var journalEntry = new JournalEntryDto
{
    Description = "Month-end adjustment",
    SourceType = GLSourceType.Manual,    // Manual entry
    Status = TransactionStatus.Pending,  // Awaiting review
    Lines = new[]
    {
        new JournalEntryLineDto 
        { 
            AccountId = accountId1,
            DebitAmount = 500m 
        },
        new JournalEntryLineDto 
        { 
            AccountId = accountId2,
            CreditAmount = 500m 
        }
    }
};
```

---

## Enum Helper Methods (Extension Classes)

### Display Enum as String
```csharp
public static class EnumExtensions
{
    public static string ToDisplayString(this AccountType type) => type switch
    {
        AccountType.Asset => "Asset Account",
        AccountType.Liability => "Liability Account",
        AccountType.Equity => "Equity Account",
        AccountType.Revenue => "Revenue Account",
        AccountType.Expense => "Expense Account",
        _ => "Unknown"
    };

    public static string ToDisplayString(this GLSourceType type) => type switch
    {
        GLSourceType.GRN => "Goods Receipt",
        GLSourceType.Invoice => "Customer Invoice",
        GLSourceType.Manual => "Manual Entry",
        GLSourceType.Payment => "Payment",
        GLSourceType.JournalEntry => "Journal Entry",
        _ => "Unknown"
    };
}
```

### Usage in UI
```csharp
// In Angular template
<span>{{ accountType | accountTypeDisplay }}</span>
→ Displays: "Asset Account"

<span>{{ entry.sourceType | sourceTypeDisplay }}</span>
→ Displays: "Goods Receipt"
```

---

## Validation Rules by Enum

### AccountType Validation
```
Asset + Liability + Equity = Total Assets
Revenue - Expense = Net Income

Assets = Liabilities + Equity  ← Accounting Equation
```

### GLSourceType Validation
```
GRN → Debit: Inventory, Credit: AP
Invoice → Debit: AR, Credit: Revenue (+ COGS/Inventory)
Manual → User-defined (must balance)
Payment → Debit: Cash, Credit: AP/AR
```

### TransactionStatus Validation
```
Can only Reverse:   Posted entries
Can only Post:      Pending entries
Cannot modify:      Posted/Reversed entries
```

---

## Migration from Strings to Enums

If you have existing string data in database:

```sql
-- Add temporary enum column
ALTER TABLE Accounts ADD AccountType_New INT NULL;

-- Map strings to enum values
UPDATE Accounts SET AccountType_New = CASE 
    WHEN AccountType = 'Asset' THEN 1
    WHEN AccountType = 'Liability' THEN 2
    WHEN AccountType = 'Equity' THEN 3
    WHEN AccountType = 'Revenue' THEN 4
    WHEN AccountType = 'Expense' THEN 5
END;

-- Drop old column, rename new
ALTER TABLE Accounts DROP COLUMN AccountType;
EXEC sp_rename 'Accounts.AccountType_New', 'AccountType';

-- Make it NOT NULL
ALTER TABLE Accounts ALTER COLUMN AccountType INT NOT NULL;
```

---

## Troubleshooting

### Error: "Invalid enum value"
```csharp
// ❌ Wrong - string instead of enum
var account = new Account { AccountType = "Asset" };  // Compile error

// ✅ Correct - use enum
var account = new Account { AccountType = AccountType.Asset };
```

### Error: "Enum value doesn't exist"
```csharp
// ❌ Wrong - typo in enum name
var entry = new GeneralLedger { SourceType = GLSourceType.Grn };  // Compile error

// ✅ Correct - proper enum name
var entry = new GeneralLedger { SourceType = GLSourceType.GRN };
```

### Error: "Cannot implicitly convert int to enum"
```csharp
// ❌ Wrong - assigning int directly
var status = new GeneralLedger { Status = 2 };  // Compile error

// ✅ Correct - cast from int
var status = new GeneralLedger { Status = (TransactionStatus)2 };

// ✅ Better - use enum
var status = new GeneralLedger { Status = TransactionStatus.Posted };
```

---

## Summary Table

| Enum | Values | Default | Use Case |
|------|--------|---------|----------|
| **AccountType** | Asset, Liability, Equity, Revenue, Expense | - | Classify accounts in CoA |
| **GLSourceType** | GRN, Invoice, Manual, Payment, JournalEntry | - | Track transaction origin |
| **TransactionStatus** | Pending, Posted, Reversed, Rejected | Posted | Manage GL entry state |
| **CurrencyCode** | USD, EUR, GBP, INR, AUD, CAD, JPY, CHF, SEK, NZD | USD | Multi-currency support |

---

**Last Updated**: 2025-01-15  
**Format**: Quick Reference Guide  
**Related Docs**: ENUM_IMPLEMENTATION_GUIDE.md, COMPANYID_DESIGN_DECISION.md
