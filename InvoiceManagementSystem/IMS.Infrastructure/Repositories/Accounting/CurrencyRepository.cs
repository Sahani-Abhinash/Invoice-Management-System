using IMS.Application.Interfaces.Accounting;
using IMS.Domain.Entities.Accounting;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Repositories.Accounting
{
    public class CurrencyRepository : ICurrencyRepository
    {
        private readonly AppDbContext _context;

        public CurrencyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Currency?> GetByIdAsync(Guid id)
        {
            return await _context.Set<Currency>()
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        }

        public async Task<Currency?> GetByCodeAsync(string code)
        {
            return await _context.Set<Currency>()
                .FirstOrDefaultAsync(c => c.Code == code && !c.IsDeleted);
        }

        public async Task<List<Currency>> GetAllAsync()
        {
            return await _context.Set<Currency>()
                .Where(c => !c.IsDeleted)
                .OrderBy(c => c.Code)
                .ToListAsync();
        }

        public async Task<List<Currency>> GetActiveAsync()
        {
            return await _context.Set<Currency>()
                .Where(c => !c.IsDeleted && c.IsActive)
                .OrderBy(c => c.Code)
                .ToListAsync();
        }

        public async Task<Currency> CreateAsync(Currency currency)
        {
            _context.Set<Currency>().Add(currency);
            await _context.SaveChangesAsync();
            return currency;
        }

        public async Task<Currency> UpdateAsync(Currency currency)
        {
            _context.Set<Currency>().Update(currency);
            await _context.SaveChangesAsync();
            return currency;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var currency = await _context.Set<Currency>().FindAsync(id);
            if (currency == null) return false;

            currency.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(string code)
        {
            return await _context.Set<Currency>()
                .AnyAsync(c => c.Code == code && !c.IsDeleted);
        }
    }
}
