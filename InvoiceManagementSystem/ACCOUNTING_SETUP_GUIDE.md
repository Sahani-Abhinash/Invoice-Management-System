# Accounting System Setup and Testing Guide

## Prerequisites

Before setting up the accounting system, ensure:
1. SQL Server is running
2. .NET 8 SDK is installed
3. Node.js and Angular CLI are installed
4. Database connection string is configured in `appsettings.json`

## Step 1: Create Database Migration

```bash
cd D:\Projects\Invoice Management System\InvoiceManagementSystem\IMS.Infrastructure
dotnet ef migrations add AddAccountingTables --startup-project ..\IMS.API
```

## Step 2: Apply Migration to Database

```bash
dotnet ef database update --startup-project ..\IMS.API
```

This will create the following tables:
- `Accounts` - Chart of accounts
- `JournalEntries` - Journal entry headers
- `JournalEntryLines` - Journal entry line items

## Step 3: Start the API

```bash
cd ..\IMS.API
dotnet run
```

The API should start at `http://localhost:5001` (or `https://localhost:5001`)

## Step 4: Initialize Chart of Accounts

### Option A: Using Swagger
1. Navigate to `http://localhost:5001/swagger`
2. Find `POST /api/accounting/setup/initialize-chart-of-accounts`
3. Click "Try it out"
4. Click "Execute"

### Option B: Using curl

```bash
curl -X POST http://localhost:5001/api/accounting/setup/initialize-chart-of-accounts
```

### Option C: Using Postman
1. Create a new POST request
2. URL: `http://localhost:5001/api/accounting/setup/initialize-chart-of-accounts`
3. Click Send

**Expected Response:**
```json
{
  "message": "Chart of accounts initialized successfully"
}
```

This creates 21 default accounts including:
- Cash (101)
- Bank Account (102)
- Accounts Receivable (103)
- Inventory (104)
- Accounts Payable (201)
- Tax Payable (202)
- Owner's Equity (301)
- Sales Revenue (401)
- Cost of Goods Sold (501)
- Operating Expenses (502)
- etc.

## Step 5: Verify Account Creation

```bash
curl http://localhost:5001/api/accounting/accounts
```

You should see a list of all created accounts.

## Step 6: Start the Angular App

```bash
cd ..\ims.ClientApp
npm install  # If not already done
npm start
```

The app should start at `http://localhost:4200`

## Step 7: Access Financial Dashboard

1. Navigate to `http://localhost:4200/accounting/dashboard`
2. You should see the Financial Dashboard with:
   - Financial Position (Assets, Liabilities, Equity)
   - Profitability (Revenue, Expenses, Net Income)
   - Key Account Balances (Cash, AR, AP, Inventory)

**Note:** Initially all balances will be zero since no transactions have been recorded.

## Step 8: Test Automatic Journal Entries

### Test Invoice Creation

1. Create an invoice through the UI or API:

```json
POST http://localhost:5001/api/invoice
{
  "reference": "INV-001",
  "poNumber": "PO-001",
  "invoiceDate": "2025-12-30",
  "dueDate": "2026-01-30",
  "customerId": "customer-guid-here",
  "branchId": "branch-guid-here",
  "taxRate": 10,
  "lines": [
    {
      "itemId": "item-guid-here",
      "quantity": 5,
      "unitPrice": 100
    }
  ]
}
```

**What happens:**
- Invoice is created with total = $550 (subtotal $500 + tax $50)
- Journal entry is automatically created:
  ```
  Dr. Accounts Receivable (103)    $550
      Cr. Sales Revenue (401)             $500
      Cr. Tax Payable (202)                $50
  ```
- Entry is automatically posted, updating account balances

### Test Payment Recording

2. Record a payment for the invoice:

```json
POST http://localhost:5001/api/invoice/{invoice-id}/payment
{
  "amount": 300,
  "method": 1  // Cash
}
```

**What happens:**
- Payment is recorded
- Journal entry is automatically created:
  ```
  Dr. Cash (101)                   $300
      Cr. Accounts Receivable (103)       $300
  ```
- Entry is automatically posted
- Invoice status updates to "PartiallyPaid"

## Step 9: Verify Journal Entries

### View all journal entries:

```bash
GET http://localhost:5001/api/accounting/journal-entries
```

You should see two entries:
1. Invoice creation entry
2. Payment received entry

### View journal entries for a specific invoice:

```bash
GET http://localhost:5001/api/accounting/journal-entries/date-range?startDate=2025-12-01&endDate=2025-12-31
```

## Step 10: View Financial Reports

### Balance Sheet

```bash
GET http://localhost:5001/api/accounting/reports/balance-sheet?asOfDate=2025-12-30
```

**Expected Result:**
```json
{
  "asOfDate": "2025-12-30",
  "totalAssets": 250,
  "totalLiabilities": 50,
  "totalEquity": 200,
  "assets": [
    {
      "accountCode": "101",
      "accountName": "Cash",
      "balance": 300
    },
    {
      "accountCode": "103",
      "accountName": "Accounts Receivable",
      "balance": 250  // 550 - 300
    }
  ],
  "liabilities": [
    {
      "accountCode": "202",
      "accountName": "Tax Payable",
      "balance": 50
    }
  ],
  "equity": []
}
```

### Income Statement

```bash
GET http://localhost:5001/api/accounting/reports/income-statement?startDate=2025-01-01&endDate=2025-12-31
```

**Expected Result:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "totalRevenue": 500,
  "totalExpenses": 0,
  "netIncome": 500,
  "revenue": [
    {
      "accountCode": "401",
      "accountName": "Sales Revenue",
      "balance": 500
    }
  ],
  "expenses": []
}
```

### Financial Summary

```bash
GET http://localhost:5001/api/accounting/reports/financial-summary?asOfDate=2025-12-30
```

This provides a quick overview of all key financial metrics.

## Step 11: Test Manual Journal Entry

Create a manual adjustment entry:

```json
POST http://localhost:5001/api/accounting/journal-entries
{
  "reference": "ADJ-001",
  "transactionDate": "2025-12-30",
  "transactionType": 7,
  "description": "Office supplies expense",
  "lines": [
    {
      "accountId": "operating-expenses-account-id",
      "debitAmount": 100,
      "creditAmount": 0,
      "description": "Office supplies purchased"
    },
    {
      "accountId": "cash-account-id",
      "debitAmount": 0,
      "creditAmount": 100,
      "description": "Payment for supplies"
    }
  ]
}
```

**Note:** Entry is created but NOT posted automatically. You must post it manually.

### Post the manual entry:

```bash
POST http://localhost:5001/api/accounting/journal-entries/{entry-id}/post
```

This will update the account balances.

## Troubleshooting

### Issue: "Required accounts not found"

**Solution:** Run the initialize chart of accounts endpoint again.

### Issue: Journal entry creation fails with "not balanced"

**Solution:** Ensure total debits equal total credits in your manual entries.

### Issue: Cannot modify posted journal entry

**Solution:** Posted entries are immutable. Create a reversing entry instead.

### Issue: Frontend shows zero balances

**Solution:** 
1. Check that chart of accounts is initialized
2. Create test invoices and payments
3. Verify journal entries are posted (check `isPosted` field)

### Issue: CORS error in browser

**Solution:** Verify CORS is configured in `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy => policy.WithOrigins("http://localhost:4200")
                       .AllowAnyHeader()
                       .AllowAnyMethod());
});
```

## Next Steps

1. **Add Navigation Menu Item**
   - Update your main navigation to include a link to `/accounting/dashboard`

2. **Implement Additional Reports**
   - Balance Sheet component
   - Income Statement component
   - Trial Balance component
   - Chart of Accounts management

3. **Add Export Functionality**
   - Export reports to PDF
   - Export to Excel
   - Print functionality

4. **Implement Permissions**
   - Restrict accounting features to authorized users
   - Implement approval workflow for manual entries

5. **Add Purchase Order Accounting**
   - Create journal entries when goods are received
   - Track inventory and accounts payable

## Testing Checklist

- [ ] Database migration successful
- [ ] Chart of accounts initialized
- [ ] Can create invoices
- [ ] Journal entries created automatically for invoices
- [ ] Can record payments
- [ ] Journal entries created automatically for payments
- [ ] Balance sheet shows correct data
- [ ] Income statement shows correct data
- [ ] Financial summary displays properly
- [ ] Can create manual journal entries
- [ ] Can post manual journal entries
- [ ] Trial balance is balanced
- [ ] Frontend dashboard loads without errors
- [ ] All account balances are correct

## Sample Test Data Script

```sql
-- Check all accounts
SELECT * FROM Accounts ORDER BY Code;

-- Check all journal entries
SELECT je.*, COUNT(jel.Id) as LineCount
FROM JournalEntries je
LEFT JOIN JournalEntryLines jel ON je.Id = jel.JournalEntryId
GROUP BY je.Id, je.Reference, je.TransactionDate, je.IsPosted;

-- Check account balances
SELECT Code, Name, Balance, AccountType
FROM Accounts
WHERE Balance != 0
ORDER BY Code;

-- Verify debits = credits
SELECT 
    SUM(DebitAmount) as TotalDebits,
    SUM(CreditAmount) as TotalCredits,
    SUM(DebitAmount) - SUM(CreditAmount) as Difference
FROM JournalEntryLines;
```

## Summary

You now have a fully functional double-entry accounting system integrated with your Invoice Management System! The system automatically tracks all financial transactions and provides comprehensive financial reporting capabilities.
