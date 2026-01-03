using IMS.Application.DTOs.Accounting;
using IMS.Application.Interfaces.Accounting;
using IMS.Domain.Entities.Accounting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Accounting
{
    public class CurrencyService
    {
        private readonly ICurrencyRepository _currencyRepository;

        public CurrencyService(ICurrencyRepository currencyRepository)
        {
            _currencyRepository = currencyRepository;
        }

        public async Task<List<CurrencyDto>> GetAllCurrenciesAsync()
        {
            var currencies = await _currencyRepository.GetAllAsync();
            return currencies.Select(MapToDto).ToList();
        }

        public async Task<List<CurrencyDto>> GetActiveCurrenciesAsync()
        {
            var currencies = await _currencyRepository.GetActiveAsync();
            return currencies.Select(MapToDto).ToList();
        }

        public async Task<CurrencyDto?> GetCurrencyByIdAsync(Guid id)
        {
            var currency = await _currencyRepository.GetByIdAsync(id);
            return currency == null ? null : MapToDto(currency);
        }

        public async Task<CurrencyDto?> GetCurrencyByCodeAsync(string code)
        {
            var currency = await _currencyRepository.GetByCodeAsync(code);
            return currency == null ? null : MapToDto(currency);
        }

        public async Task<CurrencyDto> CreateCurrencyAsync(CreateCurrencyDto dto)
        {
            // Validate code doesn't already exist
            if (await _currencyRepository.ExistsAsync(dto.Code))
            {
                throw new InvalidOperationException($"Currency with code '{dto.Code}' already exists");
            }

            var currency = new Currency
            {
                Code = dto.Code.ToUpper(),
                Name = dto.Name,
                Symbol = dto.Symbol,
                IsActive = dto.IsActive
            };

            var created = await _currencyRepository.CreateAsync(currency);
            return MapToDto(created);
        }

        public async Task UpdateCurrencyAsync(Guid id, CreateCurrencyDto dto)
        {
            var currency = await _currencyRepository.GetByIdAsync(id);
            if (currency == null)
            {
                throw new InvalidOperationException("Currency not found");
            }

            // Update properties (code should not be changed)
            currency.Name = dto.Name;
            currency.Symbol = dto.Symbol;
            currency.IsActive = dto.IsActive;

            await _currencyRepository.UpdateAsync(currency);
        }

        public async Task<bool> DeleteCurrencyAsync(Guid id)
        {
            return await _currencyRepository.DeleteAsync(id);
        }

        private static CurrencyDto MapToDto(Currency currency)
        {
            return new CurrencyDto
            {
                Id = currency.Id,
                Code = currency.Code,
                Name = currency.Name,
                Symbol = currency.Symbol,
                IsActive = currency.IsActive
            };
        }
    }
}
