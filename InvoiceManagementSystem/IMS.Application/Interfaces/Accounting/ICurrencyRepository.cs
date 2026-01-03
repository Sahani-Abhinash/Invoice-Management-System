using IMS.Domain.Entities.Accounting;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Accounting
{
    public interface ICurrencyRepository
    {
        Task<Currency?> GetByIdAsync(Guid id);
        Task<Currency?> GetByCodeAsync(string code);
        Task<List<Currency>> GetAllAsync();
        Task<List<Currency>> GetActiveAsync();
        Task<Currency> CreateAsync(Currency currency);
        Task<Currency> UpdateAsync(Currency currency);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(string code);
    }
}
