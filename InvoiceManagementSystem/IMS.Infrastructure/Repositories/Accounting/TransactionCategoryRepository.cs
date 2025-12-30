using IMS.Application.Interfaces.Accounting;
using IMS.Domain.Entities.Accounting;
using IMS.Domain.Enums;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Repositories.Accounting
{
    public class TransactionCategoryRepository : ITransactionCategoryRepository
    {
        private readonly AppDbContext _context;

        public TransactionCategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TransactionCategory?> GetByIdAsync(Guid id)
        {
            return await _context.TransactionCategories
                .Include(c => c.GlAccount)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        }

        public async Task<List<TransactionCategory>> GetAllAsync()
        {
            return await _context.TransactionCategories
                .Include(c => c.GlAccount)
                .Where(c => !c.IsDeleted)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<List<TransactionCategory>> GetByTypeAsync(IncomeExpenseType type)
        {
            return await _context.TransactionCategories
                .Include(c => c.GlAccount)
                .Where(c => c.Type == type && !c.IsDeleted)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<TransactionCategory> CreateAsync(TransactionCategory category)
        {
            _context.TransactionCategories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<TransactionCategory> UpdateAsync(TransactionCategory category)
        {
            _context.TransactionCategories.Update(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var category = await _context.TransactionCategories.FindAsync(id);
            if (category == null) return false;

            category.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
