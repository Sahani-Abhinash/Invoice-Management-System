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
    }
}
