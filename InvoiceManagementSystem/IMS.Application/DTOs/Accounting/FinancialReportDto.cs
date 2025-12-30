using System;
using System.Collections.Generic;

namespace IMS.Application.DTOs.Accounting
{
    public class BalanceSheetDto
    {
        public DateTime AsOfDate { get; set; }
        public decimal TotalAssets { get; set; }
        public decimal TotalLiabilities { get; set; }
        public decimal TotalEquity { get; set; }
        public List<AccountBalanceDto> Assets { get; set; } = new List<AccountBalanceDto>();
        public List<AccountBalanceDto> Liabilities { get; set; } = new List<AccountBalanceDto>();
        public List<AccountBalanceDto> Equity { get; set; } = new List<AccountBalanceDto>();
    }

    public class IncomeStatementDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
        public List<AccountBalanceDto> Revenue { get; set; } = new List<AccountBalanceDto>();
        public List<AccountBalanceDto> Expenses { get; set; } = new List<AccountBalanceDto>();
    }

    public class TrialBalanceDto
    {
        public DateTime AsOfDate { get; set; }
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public bool IsBalanced { get; set; }
        public List<AccountBalanceDto> Accounts { get; set; } = new List<AccountBalanceDto>();
    }

    public class CashFlowDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal OperatingActivities { get; set; }
        public decimal InvestingActivities { get; set; }
        public decimal FinancingActivities { get; set; }
        public decimal NetCashFlow { get; set; }
        public decimal BeginningCash { get; set; }
        public decimal EndingCash { get; set; }
    }

    public class FinancialSummaryDto
    {
        public DateTime AsOfDate { get; set; }
        public decimal TotalAssets { get; set; }
        public decimal TotalLiabilities { get; set; }
        public decimal TotalEquity { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
        public decimal Cash { get; set; }
        public decimal AccountsReceivable { get; set; }
        public decimal AccountsPayable { get; set; }
        public decimal Inventory { get; set; }
    }
}
