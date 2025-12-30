# Double-Entry Accounting System Implementation

## Overview

This implementation provides a complete double-entry accounting/bookkeeping system for the Invoice Management System. It automatically tracks all financial transactions from Purchase Orders, Invoices, and Payments, giving the company owner complete visibility into the financial status.

## Key Features

### 1. **Double-Entry Bookkeeping**
- Every transaction has equal debits and credits (balanced entries)
- Follows standard accounting principles
- Automatic validation ensures entries balance

### 2. **Chart of Accounts**
Organized into 5 main categories:
- **Assets (100s)**: Cash, Bank, Accounts Receivable, Inventory, Fixed Assets
- **Liabilities (200s)**: Accounts Payable, Tax Payable, Accrued Expenses
- **Equity (300s)**: Owner's Equity, Retained Earnings
- **Revenue (400s)**: Sales Revenue, Service Revenue, Other Income
- **Expenses (500s)**: COGS, Operating Expenses, Salaries, Utilities, etc.

### 3. **Automatic Journal Entries**
The system automatically creates journal entries for:

#### **Invoice Creation**
```
Dr. Accounts Receivable (103)    $1,000
    Cr. Sales Revenue (401)              $900
    Cr. Tax Payable (202)                $100
```

#### **Payment Received**
```
Dr. Cash/Bank (101/102)          $500
    Cr. Accounts Receivable (103)        $500
```

#### **Goods Received (future)**
```
Dr. Inventory (104)              $1,000
    Cr. Accounts Payable (201)           $1,000
```

#### **Payment Made (future)**
```
Dr. Accounts Payable (201)       $1,000
    Cr. Cash/Bank (101/102)              $1,000
```

### 4. **Financial Reports**

#### **Balance Sheet**
- Shows financial position at a point in time
- Assets = Liabilities + Equity
- Endpoints: `GET /api/accounting/reports/balance-sheet`

#### **Income Statement (Profit & Loss)**
- Shows profitability over a period
- Revenue - Expenses = Net Income
- Endpoints: `GET /api/accounting/reports/income-statement`

#### **Trial Balance**
- Verifies all debits equal credits
- Lists all accounts with balances
- Endpoints: `GET /api/accounting/reports/trial-balance`

#### **Financial Summary**
- Quick dashboard view
- Key metrics: Assets, Liabilities, Equity, Revenue, Expenses, Net Income
- Cash, AR, AP, Inventory balances
- Endpoints: `GET /api/accounting/reports/financial-summary`

## Database Schema

### Account Table
```csharp
- Id: Guid (PK)
- Code: string (e.g., "101", "401")
- Name: string (e.g., "Cash", "Sales Revenue")
- Description: string
- AccountType: AccountType enum
- ParentAccountId: Guid? (for sub-accounts)
- Balance: decimal
- IsActive: bool
```

### JournalEntry Table
```csharp
- Id: Guid (PK)
- Reference: string (e.g., "INV-12345", "PMT-ABCD")
- TransactionDate: DateTime
- TransactionType: TransactionType enum
- Description: string
- RelatedEntityId: Guid? (links to Invoice, Payment, etc.)
- RelatedEntityType: string
- IsPosted: bool
- PostedDate: DateTime?
```

### JournalEntryLine Table
```csharp
- Id: Guid (PK)
- JournalEntryId: Guid (FK)
- AccountId: Guid (FK)
- DebitAmount: decimal
- CreditAmount: decimal
- Description: string
```

## API Endpoints

### Accounts
- `GET /api/accounting/accounts` - Get all accounts
- `GET /api/accounting/accounts/{id}` - Get account by ID
- `GET /api/accounting/accounts/code/{code}` - Get account by code
- `POST /api/accounting/accounts` - Create new account
- `PUT /api/accounting/accounts/{id}` - Update account
- `DELETE /api/accounting/accounts/{id}` - Delete account

### Journal Entries
- `GET /api/accounting/journal-entries` - Get all entries
- `GET /api/accounting/journal-entries/{id}` - Get entry by ID
- `GET /api/accounting/journal-entries/date-range?startDate=&endDate=` - Get entries by date
- `POST /api/accounting/journal-entries` - Create manual entry
- `POST /api/accounting/journal-entries/{id}/post` - Post entry (update balances)

### Financial Reports
- `GET /api/accounting/reports/balance-sheet?asOfDate=` - Balance Sheet
- `GET /api/accounting/reports/income-statement?startDate=&endDate=` - Income Statement
- `GET /api/accounting/reports/trial-balance?asOfDate=` - Trial Balance
- `GET /api/accounting/reports/financial-summary?asOfDate=` - Financial Summary

### Setup
- `POST /api/accounting/setup/initialize-chart-of-accounts` - Create default accounts

## Implementation Steps

### 1. Run Database Migration

```bash
cd IMS.Infrastructure
dotnet ef migrations add AddAccountingTables --startup-project ../IMS.API
dotnet ef database update --startup-project ../IMS.API
```

### 2. Initialize Chart of Accounts

```bash
# Call the API endpoint
POST http://localhost:5000/api/accounting/setup/initialize-chart-of-accounts
```

This creates the default accounts:
- 101: Cash
- 102: Bank Account
- 103: Accounts Receivable
- 104: Inventory
- 201: Accounts Payable
- 202: Tax Payable
- 301: Owner's Equity
- 302: Retained Earnings
- 401: Sales Revenue
- 501: Cost of Goods Sold
- 502: Operating Expenses
- etc.

### 3. Integration with Invoice System

The accounting entries are automatically created when:

#### **Creating an Invoice**
Update `InvoiceService.CreateAsync()`:
```csharp
var invoice = await _invoiceService.CreateAsync(dto);
await _accountingService.CreateInvoiceEntriesAsync(invoice.Id);
```

#### **Recording a Payment**
Update `PaymentService.RecordPaymentAsync()`:
```csharp
var payment = await _paymentService.RecordPaymentAsync(invoiceId, dto);
await _accountingService.CreatePaymentReceivedEntriesAsync(payment.Id);
```

## Accounting Rules

### Normal Balances
- **Assets**: Debit (increases with debit, decreases with credit)
- **Liabilities**: Credit (increases with credit, decreases with debit)
- **Equity**: Credit (increases with credit, decreases with debit)
- **Revenue**: Credit (increases with credit, decreases with debit)
- **Expenses**: Debit (increases with debit, decreases with credit)

### Journal Entry Validation
- Total Debits MUST equal Total Credits
- Cannot post an unbalanced entry
- Cannot modify or delete posted entries (must create reversing entry)

## Frontend Implementation

### 1. Dashboard Component
Create a financial dashboard showing:
- Total Assets
- Total Liabilities
- Total Equity
- Current Month Revenue
- Current Month Expenses
- Net Income
- Cash Balance
- Accounts Receivable
- Accounts Payable

### 2. Chart of Accounts Component
- List all accounts
- Create/Edit/Deactivate accounts
- View account details and transaction history

### 3. Journal Entries Component
- List all journal entries
- Create manual journal entries
- View entry details
- Post entries

### 4. Financial Reports Components
- Balance Sheet viewer
- Income Statement viewer
- Trial Balance viewer
- Date range selectors
- Export to PDF/Excel

## Example Usage

### Create a Manual Journal Entry

```json
POST /api/accounting/journal-entries
{
  "reference": "ADJ-001",
  "transactionDate": "2025-01-01",
  "transactionType": 7,  // Adjustment
  "description": "Depreciation expense",
  "lines": [
    {
      "accountId": "guid-of-depreciation-expense",
      "debitAmount": 500,
      "creditAmount": 0,
      "description": "Monthly depreciation"
    },
    {
      "accountId": "guid-of-accumulated-depreciation",
      "debitAmount": 0,
      "creditAmount": 500,
      "description": "Monthly depreciation"
    }
  ]
}
```

### Get Financial Summary

```
GET /api/accounting/reports/financial-summary?asOfDate=2025-12-31

Response:
{
  "asOfDate": "2025-12-31",
  "totalAssets": 50000,
  "totalLiabilities": 15000,
  "totalEquity": 35000,
  "totalRevenue": 100000,
  "totalExpenses": 65000,
  "netIncome": 35000,
  "cash": 5000,
  "accountsReceivable": 10000,
  "accountsPayable": 8000,
  "inventory": 20000
}
```

## Files Created

### Domain Layer
- `IMS.Domain/Enums/AccountType.cs`
- `IMS.Domain/Enums/TransactionType.cs`
- `IMS.Domain/Entities/Accounting/Account.cs`
- `IMS.Domain/Entities/Accounting/JournalEntry.cs`
- `IMS.Domain/Entities/Accounting/JournalEntryLine.cs`

### Application Layer
- `IMS.Application/DTOs/Accounting/AccountDto.cs`
- `IMS.Application/DTOs/Accounting/JournalEntryDto.cs`
- `IMS.Application/DTOs/Accounting/FinancialReportDto.cs`
- `IMS.Application/Interfaces/Accounting/IAccountRepository.cs`
- `IMS.Application/Interfaces/Accounting/IJournalEntryRepository.cs`
- `IMS.Application/Interfaces/Accounting/IAccountingService.cs`

### Infrastructure Layer
- `IMS.Infrastructure/Repositories/Accounting/AccountRepository.cs`
- `IMS.Infrastructure/Repositories/Accounting/JournalEntryRepository.cs`
- `IMS.Infrastructure/Services/Accounting/AccountingService.cs`
- `IMS.Infrastructure/Persistence/AppDbContext.cs` (updated)

### API Layer
- `IMS.API/Controllers/AccountingController.cs`
- `IMS.API/Program.cs` (updated)

## Next Steps

1. ✅ Create database migration
2. ✅ Initialize chart of accounts
3. Update Invoice creation to trigger accounting entries
4. Update Payment recording to trigger accounting entries
5. Implement GRN accounting entries
6. Create Angular frontend components
7. Add export functionality for reports
8. Implement account reconciliation
9. Add audit trail for all accounting changes
10. Implement multi-company/branch accounting

## Benefits

- **Complete Financial Visibility**: Owner can see real-time financial status
- **Audit Trail**: Every transaction is tracked with journal entries
- **Compliance**: Follows standard double-entry accounting principles
- **Reporting**: Generate balance sheets, income statements, trial balances
- **Automated**: Entries created automatically from business transactions
- **Flexible**: Can create manual entries for adjustments
- **Validated**: System ensures all entries balance correctly

## Security Considerations

- Restrict accounting endpoints to admin users
- Implement permission-based access control
- Log all accounting changes for audit
- Prevent deletion of posted entries
- Require approval workflow for manual entries
- Regular backups of financial data
