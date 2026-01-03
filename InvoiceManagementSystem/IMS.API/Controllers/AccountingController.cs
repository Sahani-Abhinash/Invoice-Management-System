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
