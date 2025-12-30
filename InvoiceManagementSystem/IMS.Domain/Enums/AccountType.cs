namespace IMS.Domain.Enums
{
    public enum AccountType
    {
        // Assets
        Asset = 1,
        Cash = 101,
        BankAccount = 102,
        AccountsReceivable = 103,
        Inventory = 104,
        PrepaidExpenses = 105,
        FixedAssets = 106,

        // Liabilities
        Liability = 2,
        AccountsPayable = 201,
        TaxPayable = 202,
        AccruedExpenses = 203,
        LongTermDebt = 204,

        // Equity
        Equity = 3,
        OwnersEquity = 301,
        RetainedEarnings = 302,

        // Revenue
        Revenue = 4,
        SalesRevenue = 401,
        ServiceRevenue = 402,
        OtherIncome = 403,

        // Expenses
        Expense = 5,
        CostOfGoodsSold = 501,
        OperatingExpenses = 502,
        Salaries = 503,
        Utilities = 504,
        Depreciation = 505,
        TaxExpense = 506,
        OtherExpenses = 507
    }
}
