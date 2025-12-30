using IMS.Application.DTOs.Accounting;
using IMS.Application.Interfaces.Accounting;
using IMS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace IMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountingController : ControllerBase
    {
        private readonly IAccountingService _accountingService;

        public AccountingController(IAccountingService accountingService)
        {
            _accountingService = accountingService;
        }

        // ===== ACCOUNTS =====

        [HttpGet("accounts")]
        public async Task<IActionResult> GetAllAccounts()
        {
            var accounts = await _accountingService.GetAllAccountsAsync();
            return Ok(accounts);
        }

        [HttpGet("accounts/{id}")]
        public async Task<IActionResult> GetAccountById(Guid id)
        {
            var account = await _accountingService.GetAccountByIdAsync(id);
            if (account == null)
                return NotFound();

            return Ok(account);
        }

        [HttpPost("accounts")]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountDto dto)
        {
            var account = await _accountingService.CreateAccountAsync(dto);
            return CreatedAtAction(nameof(GetAccountById), new { id = account.Id }, account);
        }

        [HttpPut("accounts/{id}")]
        public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] CreateAccountDto dto)
        {
            var account = await _accountingService.UpdateAccountAsync(id, dto);
            return Ok(account);
        }

        [HttpDelete("accounts/{id}")]
        public async Task<IActionResult> DeleteAccount(Guid id)
        {
            var result = await _accountingService.DeleteAccountAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        // ===== CATEGORIES =====

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories([FromQuery] IncomeExpenseType? type = null)
        {
            var categories = await _accountingService.GetCategoriesAsync(type);
            return Ok(categories);
        }

        [HttpGet("categories/{id}")]
        public async Task<IActionResult> GetCategoryById(Guid id)
        {
            var category = await _accountingService.GetCategoryByIdAsync(id);
            if (category == null)
                return NotFound();

            return Ok(category);
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateIncomeExpenseCategoryDto dto)
        {
            var category = await _accountingService.CreateCategoryAsync(dto);
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
        }

        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CreateIncomeExpenseCategoryDto dto)
        {
            var category = await _accountingService.UpdateCategoryAsync(id, dto);
            return Ok(category);
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var result = await _accountingService.DeleteCategoryAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        // ===== TRANSACTIONS =====

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] IncomeExpenseType? type = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] Guid? categoryId = null)
        {
            var transactions = await _accountingService.GetTransactionsAsync(type, startDate, endDate, categoryId);
            return Ok(transactions);
        }

        [HttpGet("transactions/{id}")]
        public async Task<IActionResult> GetTransactionById(Guid id)
        {
            var transaction = await _accountingService.GetTransactionByIdAsync(id);
            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        [HttpPost("transactions")]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateIncomeExpenseTransactionDto dto)
        {
            var transaction = await _accountingService.CreateTransactionAsync(dto);
            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, transaction);
        }

        [HttpPost("transactions/{id}/post")]
        public async Task<IActionResult> PostTransaction(Guid id)
        {
            var result = await _accountingService.PostTransactionAsync(id);
            if (!result)
                return NotFound();

            return Ok(new { message = "Transaction posted successfully" });
        }

        // ===== FINANCIAL REPORTS =====

        [HttpGet("reports/balance-sheet")]
        public async Task<IActionResult> GetBalanceSheet([FromQuery] DateTime? asOfDate)
        {
            var date = asOfDate ?? DateTime.UtcNow;
            var report = await _accountingService.GetBalanceSheetAsync(date);
            return Ok(report);
        }

        [HttpGet("reports/income-statement")]
        public async Task<IActionResult> GetIncomeStatement([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddYears(-1);
            var end = endDate ?? DateTime.UtcNow;
            var report = await _accountingService.GetIncomeStatementAsync(start, end);
            return Ok(report);
        }

        [HttpGet("reports/trial-balance")]
        public async Task<IActionResult> GetTrialBalance([FromQuery] DateTime? asOfDate)
        {
            var date = asOfDate ?? DateTime.UtcNow;
            var report = await _accountingService.GetTrialBalanceAsync(date);
            return Ok(report);
        }

        [HttpGet("reports/financial-summary")]
        public async Task<IActionResult> GetFinancialSummary([FromQuery] DateTime? asOfDate)
        {
            var date = asOfDate ?? DateTime.UtcNow;
            var report = await _accountingService.GetFinancialSummaryAsync(date);
            return Ok(report);
        }

        // ===== SETUP =====

        [HttpPost("setup/initialize-chart-of-accounts")]
        public async Task<IActionResult> InitializeChartOfAccounts()
        {
            await _accountingService.InitializeChartOfAccountsAsync();
            return Ok(new { message = "Chart of accounts initialized successfully" });
        }
    }
}
