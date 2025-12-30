using IMS.Application.DTOs.Accounting;
using IMS.Application.Interfaces.Accounting;
using IMS.Domain.Entities.Accounting;
using IMS.Domain.Enums;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Accounting
{
    public class AccountingService : IAccountingService
    {
        private readonly AppDbContext _context;

        public AccountingService(AppDbContext context)
        {
            _context = context;
        }

        #region Account Management

        public async Task<AccountDto?> GetAccountByIdAsync(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);
            return account == null ? null : MapAccountToDto(account);
        }

        public async Task<List<AccountDto>> GetAllAccountsAsync()
        {
            var accounts = await _context.Accounts.ToListAsync();
            return accounts.Select(MapAccountToDto).ToList();
        }

        public async Task<AccountDto> CreateAccountAsync(CreateAccountDto dto)
        {
            var account = new Account
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return MapAccountToDto(account);
        }

        public async Task<AccountDto> UpdateAccountAsync(Guid id, CreateAccountDto dto)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
                throw new InvalidOperationException("Account not found");

            account.Name = dto.Name;
            account.Description = dto.Description;

            await _context.SaveChangesAsync();
            return MapAccountToDto(account);
        }

        public async Task<bool> DeleteAccountAsync(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null) return false;
            
            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Income/Expense Categories

        public async Task<List<IncomeExpenseCategoryDto>> GetCategoriesAsync(IncomeExpenseType? type = null)
        {
            var query = _context.TransactionCategories
                .Include(c => c.GlAccount)
                .Where(c => c.IsActive);

            if (type.HasValue)
                query = query.Where(c => c.Type == type.Value);

            var categories = await query.ToListAsync();
            return categories.Select(MapCategoryToDto).ToList();
        }

        public async Task<IncomeExpenseCategoryDto?> GetCategoryByIdAsync(Guid id)
        {
            var category = await _context.TransactionCategories
                .Include(c => c.GlAccount)
                .FirstOrDefaultAsync(c => c.Id == id);
            return category == null ? null : MapCategoryToDto(category);
        }

        public async Task<IncomeExpenseCategoryDto> CreateCategoryAsync(CreateIncomeExpenseCategoryDto dto)
        {
            var category = new TransactionCategory
            {
                Name = dto.Name,
                Code = dto.Code,
                Type = dto.Type,
                GlAccountId = dto.GlAccountId,
                IsActive = dto.IsActive
            };

            _context.TransactionCategories.Add(category);
            await _context.SaveChangesAsync();
            
            await _context.Entry(category).Reference(c => c.GlAccount).LoadAsync();
            return MapCategoryToDto(category);
        }

        public async Task<IncomeExpenseCategoryDto> UpdateCategoryAsync(Guid id, CreateIncomeExpenseCategoryDto dto)
        {
            var category = await _context.TransactionCategories.FindAsync(id);
            if (category == null)
                throw new InvalidOperationException("Category not found");

            category.Name = dto.Name;
            category.Code = dto.Code;
            category.Type = dto.Type;
            category.GlAccountId = dto.GlAccountId;
            category.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            await _context.Entry(category).Reference(c => c.GlAccount).LoadAsync();
            return MapCategoryToDto(category);
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            var category = await _context.TransactionCategories.FindAsync(id);
            if (category == null) return false;
            
            _context.TransactionCategories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Income/Expense Transactions

        public async Task<List<IncomeExpenseTransactionDto>> GetTransactionsAsync(
            IncomeExpenseType? type = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null, 
            Guid? categoryId = null)
        {
            var query = _context.IncomeExpenseTransactions
                .Include(t => t.Category)
                    .ThenInclude(c => c.GlAccount)
                .Include(t => t.Account)
                .AsQueryable();

            if (type.HasValue)
                query = query.Where(t => t.Type == type.Value);

            if (startDate.HasValue)
                query = query.Where(t => t.TransactionDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(t => t.TransactionDate <= endDate.Value);

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId.Value);

            var transactions = await query.ToListAsync();
            return transactions.Select(MapTransactionToDto).ToList();
        }

        public async Task<IncomeExpenseTransactionDto?> GetTransactionByIdAsync(Guid id)
        {
            var transaction = await _context.IncomeExpenseTransactions
                .Include(t => t.Category)
                    .ThenInclude(c => c.GlAccount)
                .Include(t => t.Account)
                .FirstOrDefaultAsync(t => t.Id == id);
            return transaction == null ? null : MapTransactionToDto(transaction);
        }

        public async Task<IncomeExpenseTransactionDto> CreateTransactionAsync(CreateIncomeExpenseTransactionDto dto)
        {
            var category = await _context.TransactionCategories
                .Include(c => c.GlAccount)
                .FirstOrDefaultAsync(c => c.Id == dto.CategoryId);

            if (category == null)
                throw new InvalidOperationException("Category not found");

            var selectedAccountId = dto.AccountId ?? category.GlAccountId;

            var transaction = new IncomeExpenseTransaction
            {
                Type = dto.Type,
                CategoryId = dto.CategoryId,
                AccountId = selectedAccountId,
                Amount = dto.Amount,
                Currency = dto.Currency,
                TransactionDate = dto.TransactionDate,
                Reference = dto.Reference,
                Description = dto.Description,
                SourceModule = dto.SourceModule,
                SourceId = dto.SourceId,
                Status = dto.PostNow ? "Posted" : "Draft"
            };

            _context.IncomeExpenseTransactions.Add(transaction);
            await _context.SaveChangesAsync();
            
            await _context.Entry(transaction).Reference(t => t.Category).LoadAsync();
            await _context.Entry(transaction.Category).Reference(c => c.GlAccount).LoadAsync();
            if (transaction.AccountId.HasValue)
            {
                await _context.Entry(transaction).Reference(t => t.Account).LoadAsync();
            }
            return MapTransactionToDto(transaction);
        }

        public async Task<bool> PostTransactionAsync(Guid id)
        {
            var transaction = await _context.IncomeExpenseTransactions.FindAsync(id);
            if (transaction == null) return false;
            
            transaction.Status = "Posted";
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Financial Reports

        public async Task<BalanceSheetDto> GetBalanceSheetAsync(DateTime asOfDate)
        {
            // Simplified - calculate from transactions
            var transactions = await _context.IncomeExpenseTransactions
                .Where(t => t.TransactionDate <= asOfDate && t.Status == "Posted")
                .ToListAsync();

            // With simplified accounts (no GL types), keep balance sheet totals neutral
            var assets = 0m;
            var liabilities = 0m;
            var equity = 0m;

            return new BalanceSheetDto
            {
                AsOfDate = asOfDate,
                TotalAssets = assets,
                TotalLiabilities = liabilities,
                TotalEquity = equity,
                Assets = new List<AccountBalanceDto>(),
                Liabilities = new List<AccountBalanceDto>(),
                Equity = new List<AccountBalanceDto>()
            };
        }

        public async Task<IncomeStatementDto> GetIncomeStatementAsync(DateTime startDate, DateTime endDate)
        {
            var transactions = await _context.IncomeExpenseTransactions
                .Where(t => t.TransactionDate >= startDate && t.TransactionDate <= endDate && t.Status == "Posted")
                .ToListAsync();
            
            var revenue = transactions.Where(t => t.Type == IncomeExpenseType.Income).Sum(t => t.Amount);
            var expenses = transactions.Where(t => t.Type == IncomeExpenseType.Expense).Sum(t => t.Amount);

            return new IncomeStatementDto
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalRevenue = revenue,
                TotalExpenses = expenses,
                NetIncome = revenue - expenses,
                Revenue = new List<AccountBalanceDto>(),
                Expenses = new List<AccountBalanceDto>()
            };
        }

        public async Task<TrialBalanceDto> GetTrialBalanceAsync(DateTime asOfDate)
        {
            return new TrialBalanceDto
            {
                AsOfDate = asOfDate,
                TotalDebits = 0,
                TotalCredits = 0,
                IsBalanced = true,
                Accounts = new List<AccountBalanceDto>()
            };
        }

        public async Task<FinancialSummaryDto> GetFinancialSummaryAsync(DateTime asOfDate)
        {
            var transactions = await _context.IncomeExpenseTransactions
                .Where(t => t.TransactionDate <= asOfDate && t.Status == "Posted")
                .ToListAsync();
            
            var revenue = transactions.Where(t => t.Type == IncomeExpenseType.Income).Sum(t => t.Amount);
            var expenses = transactions.Where(t => t.Type == IncomeExpenseType.Expense).Sum(t => t.Amount);

            return new FinancialSummaryDto
            {
                AsOfDate = asOfDate,
                TotalAssets = 0,
                TotalLiabilities = 0,
                TotalEquity = 0,
                TotalRevenue = revenue,
                TotalExpenses = expenses,
                NetIncome = revenue - expenses,
                Cash = 0,
                AccountsReceivable = 0,
                AccountsPayable = 0,
                Inventory = 0
            };
        }

        #endregion

        #region Chart of Accounts Setup

        public async Task InitializeChartOfAccountsAsync()
        {
            var existing = await _context.Accounts.AnyAsync();
            if (existing)
                return;

            var accounts = new List<Account>
            {
                new Account { Name = "Cash", Description = "Cash on hand" },
                new Account { Name = "Bank Account", Description = "Bank deposits" },
                new Account { Name = "Accounts Receivable", Description = "Money owed by customers" },
                new Account { Name = "Inventory", Description = "Stock on hand" },
                new Account { Name = "Accounts Payable", Description = "Money owed to suppliers" },
                new Account { Name = "Tax Payable", Description = "Taxes owed" },
                new Account { Name = "Owner's Equity", Description = "Owner's capital" },
                new Account { Name = "Sales Revenue", Description = "Revenue from sales" },
                new Account { Name = "Service Revenue", Description = "Revenue from services" },
                new Account { Name = "Cost of Goods Sold", Description = "Direct costs" },
                new Account { Name = "Operating Expenses", Description = "General expenses" },
                new Account { Name = "Salaries", Description = "Employee salaries" }
            };

            _context.Accounts.AddRange(accounts);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Helper Methods

        private AccountDto MapAccountToDto(Account account)
        {
            return new AccountDto
            {
                Id = account.Id,
                Name = account.Name,
                Description = account.Description
            };
        }

        private IncomeExpenseCategoryDto MapCategoryToDto(TransactionCategory category)
        {
            return new IncomeExpenseCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Code = category.Code,
                Type = category.Type,
                GlAccountId = category.GlAccountId,
                GlAccountName = category.GlAccount?.Name ?? "",
                IsActive = category.IsActive
            };
        }

        private IncomeExpenseTransactionDto MapTransactionToDto(IncomeExpenseTransaction transaction)
        {
            return new IncomeExpenseTransactionDto
            {
                Id = transaction.Id,
                Type = transaction.Type,
                CategoryId = transaction.CategoryId,
                CategoryName = transaction.Category?.Name ?? "",
                AccountId = transaction.AccountId,
                AccountName = transaction.Account?.Name ?? transaction.Category?.GlAccount?.Name ?? "",
                Amount = transaction.Amount,
                Currency = transaction.Currency,
                TransactionDate = transaction.TransactionDate,
                Reference = transaction.Reference,
                Description = transaction.Description,
                SourceModule = transaction.SourceModule,
                SourceId = transaction.SourceId,
                Status = transaction.Status
            };
        }

        #endregion
    }
}
