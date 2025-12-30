using IMS.Application.DTOs.Accounting;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Accounting
{
    public interface IAccountingService
    {
        // Account Management
        Task<AccountDto?> GetAccountByIdAsync(Guid id);
        Task<List<AccountDto>> GetAllAccountsAsync();
        Task<AccountDto> CreateAccountAsync(CreateAccountDto dto);
        Task<AccountDto> UpdateAccountAsync(Guid id, CreateAccountDto dto);
        Task<bool> DeleteAccountAsync(Guid id);

        // Financial Reports
        Task<BalanceSheetDto> GetBalanceSheetAsync(DateTime asOfDate);
        Task<IncomeStatementDto> GetIncomeStatementAsync(DateTime startDate, DateTime endDate);
        Task<TrialBalanceDto> GetTrialBalanceAsync(DateTime asOfDate);
        Task<FinancialSummaryDto> GetFinancialSummaryAsync(DateTime asOfDate);

        // Chart of Accounts Setup
        Task InitializeChartOfAccountsAsync();

        // Income/Expense Categories
        Task<List<IncomeExpenseCategoryDto>> GetCategoriesAsync(IncomeExpenseType? type = null);
        Task<IncomeExpenseCategoryDto?> GetCategoryByIdAsync(Guid id);
        Task<IncomeExpenseCategoryDto> CreateCategoryAsync(CreateIncomeExpenseCategoryDto dto);
        Task<IncomeExpenseCategoryDto> UpdateCategoryAsync(Guid id, CreateIncomeExpenseCategoryDto dto);
        Task<bool> DeleteCategoryAsync(Guid id);

        // Income/Expense Transactions
        Task<List<IncomeExpenseTransactionDto>> GetTransactionsAsync(IncomeExpenseType? type = null, DateTime? startDate = null, DateTime? endDate = null, Guid? categoryId = null);
        Task<IncomeExpenseTransactionDto?> GetTransactionByIdAsync(Guid id);
        Task<IncomeExpenseTransactionDto> CreateTransactionAsync(CreateIncomeExpenseTransactionDto dto);
        Task<bool> PostTransactionAsync(Guid id);
    }
}
