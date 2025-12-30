# Accounting Module - Usage Guide

## Overview
The Accounting module provides double-entry bookkeeping functionality including Chart of Accounts, Journal Entries, and Financial Reports.

## Accessing the Accounting Module

1. **Main Navigation**: Click "Accounting" in the sidebar menu (requires Payments/Invoices permissions)
2. **Dashboard**: The accounting dashboard shows financial summary with quick links

## Chart of Accounts

### Viewing Accounts
- Navigate to: `/accounting/accounts`
- View all accounts with their codes, names, types, and balances
- Filter by account type (Asset, Liability, Equity, Revenue, Expense)
- Search by code or name

### Creating a New Account
1. Click "New Account" button
2. Fill in required fields:
   - **Account Code**: 4-6 digit code (follow the numbering guide)
   - **Account Name**: Descriptive name
   - **Description**: Optional description
   - **Account Type**: Select from predefined types
   - **Parent Account**: Optional for sub-accounts
3. Click "Create Account"

**Account Code Guide**:
- 1000-1999: Assets
- 2000-2999: Liabilities
- 3000-3999: Equity
- 4000-4999: Revenue
- 5000-5999: Expenses

### Editing an Account
1. Click the edit (pen) icon on any account in the list
2. Modify fields as needed
3. Click "Update Account"

## Journal Entries

### Viewing Journal Entries
- Navigate to: `/accounting/journal-entries`
- View all journal entries with their references, dates, and amounts
- Filter by posted/unposted status
- Search by reference or description

### Creating a Journal Entry
1. Click "New Journal Entry" button
2. Fill in header information:
   - **Reference**: Unique identifier (e.g., JE-001)
   - **Date**: Transaction date
   - **Type**: Journal Entry, Adjustment, Opening, or Closing
   - **Description**: Describe the transaction
   - **Related To**: Optional link to other entities
3. Add journal entry lines:
   - Select **Account** from dropdown
   - Enter **Debit** or **Credit** amount (not both)
   - Add line **Description** (optional)
   - Click "Add Line" to add more lines
4. Ensure total debits equal total credits (balanced indicator will show green)
5. Click "Create Journal Entry"

**Important**: 
- Every journal entry must have at least 2 lines
- Total debits must equal total credits
- Each line should have either a debit OR credit amount (not both)

### Viewing Journal Entry Details
1. Click on any journal entry in the list
2. View complete details including all lines
3. See posting status and dates

### Posting a Journal Entry
1. Open the journal entry detail view
2. Click "Post Journal Entry" button
3. Confirm the action

**Note**: Posting is permanent and cannot be undone. Once posted, the entry affects account balances.

## Journal Entry Lines

Journal entry lines represent individual account debits and credits:

- **Account**: The chart of accounts account being affected
- **Debit Amount**: Amount to debit (increase assets/expenses, decrease liabilities/revenue/equity)
- **Credit Amount**: Amount to credit (decrease assets/expenses, increase liabilities/revenue/equity)
- **Description**: Line-level description

### Example Journal Entry

**Scenario**: Record a cash sale of $1,000

| Account | Debit | Credit |
|---------|-------|--------|
| Cash (1010) | $1,000 | - |
| Sales Revenue (4010) | - | $1,000 |

Both lines reference the same journal entry with a description like "Cash sale - Invoice INV-001"

## Financial Reports

The Financial Dashboard (`/accounting/dashboard`) shows:
- **Financial Position**: Total Assets, Liabilities, Equity
- **Profitability**: Total Revenue, Expenses, Net Income
- **Key Balances**: Cash, Accounts Receivable, Accounts Payable, Inventory

## Integration with Other Modules

The accounting module automatically creates journal entries when:
- **Invoices are created**: DR Accounts Receivable, CR Sales Revenue
- **Payments are received**: DR Cash, CR Accounts Receivable
- **Purchase orders are received**: DR Inventory/Expenses, CR Accounts Payable
- **Payments are made**: DR Accounts Payable, CR Cash

## Best Practices

1. **Setup Chart of Accounts First**: Create all necessary accounts before making journal entries
2. **Use Meaningful References**: Use consistent numbering for journal entries (JE-001, JE-002, etc.)
3. **Add Descriptions**: Always describe transactions clearly
4. **Review Before Posting**: Double-check entries before posting (cannot undo)
5. **Regular Reconciliation**: Reconcile accounts regularly
6. **Backup Data**: Keep regular backups of financial data

## API Endpoints

For integration or custom development:

### Accounts
- GET `/api/accounting/accounts` - List all accounts
- GET `/api/accounting/accounts/{id}` - Get account by ID
- GET `/api/accounting/accounts/code/{code}` - Get account by code
- POST `/api/accounting/accounts` - Create account
- PUT `/api/accounting/accounts/{id}` - Update account
- DELETE `/api/accounting/accounts/{id}` - Delete account

### Journal Entries
- GET `/api/accounting/journal-entries` - List all entries
- GET `/api/accounting/journal-entries/{id}` - Get entry by ID
- GET `/api/accounting/journal-entries/date-range?startDate=&endDate=` - Get entries by date range
- POST `/api/accounting/journal-entries` - Create entry
- POST `/api/accounting/journal-entries/{id}/post` - Post entry

### Reports
- GET `/api/accounting/reports/balance-sheet?asOfDate=` - Balance sheet
- GET `/api/accounting/reports/income-statement?startDate=&endDate=` - Income statement
- GET `/api/accounting/reports/trial-balance?asOfDate=` - Trial balance
- GET `/api/accounting/reports/financial-summary?asOfDate=` - Financial summary

### Setup
- POST `/api/accounting/setup/initialize-chart-of-accounts` - Initialize default chart of accounts

## Troubleshooting

**Problem**: Cannot create journal entry
- **Solution**: Ensure you have at least 2 lines and debits equal credits

**Problem**: Account not showing in dropdown
- **Solution**: Check if account is marked as active

**Problem**: Posted entry shows incorrect balance
- **Solution**: Verify all lines are correctly entered; check other entries affecting same account

**Problem**: Cannot delete account
- **Solution**: Account may have transactions; archive instead by marking inactive

## Support

For additional help or feature requests, contact your system administrator.
