using IMS.API.Authorization;
using IMS.Application.Common;
using IMS.Application.DTOs.Accounting;
using IMS.Infrastructure.Services.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace IMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CurrencyController : ControllerBase
    {
        private readonly CurrencyService _currencyService;

        public CurrencyController(CurrencyService currencyService)
        {
            _currencyService = currencyService;
        }

        [HttpGet]
        [HasPermission(Permissions.ViewCurrencies)]
        public async Task<IActionResult> GetAll()
        {
            var currencies = await _currencyService.GetAllCurrenciesAsync();
            return Ok(currencies);
        }

        [HttpGet("active")]
        [HasPermission(Permissions.ViewCurrencies)]
        public async Task<IActionResult> GetActive()
        {
            var currencies = await _currencyService.GetActiveCurrenciesAsync();
            return Ok(currencies);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.ViewCurrencies)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var currency = await _currencyService.GetCurrencyByIdAsync(id);
            if (currency == null)
                return NotFound();

            return Ok(currency);
        }

        [HttpGet("code/{code}")]
        [HasPermission(Permissions.ViewCurrencies)]
        public async Task<IActionResult> GetByCode(string code)
        {
            var currency = await _currencyService.GetCurrencyByCodeAsync(code);
            if (currency == null)
                return NotFound();

            return Ok(currency);
        }

        [HttpPost]
        [HasPermission(Permissions.ManageCurrencies)]
        public async Task<IActionResult> Create([FromBody] CreateCurrencyDto dto)
        {
            try
            {
                var currency = await _currencyService.CreateCurrencyAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = currency.Id }, currency);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.ManageCurrencies)]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateCurrencyDto dto)
        {
            try
            {
                await _currencyService.UpdateCurrencyAsync(id, dto);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.ManageCurrencies)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _currencyService.DeleteCurrencyAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
     