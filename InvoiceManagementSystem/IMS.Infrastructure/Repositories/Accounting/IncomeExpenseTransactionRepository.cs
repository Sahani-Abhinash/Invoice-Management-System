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
    public class IncomeExpenseTransactionRepository : IIncomeExpenseTransactionRepository
    {
        private readonly AppDbContext _context;

        public IncomeExpenseTransactionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IncomeExpenseTransaction?> GetByIdAsync(Guid id)
        {
            return await _context.IncomeExpenseTransactions
                .Include(t => t.Category)
                    .ThenInclude(c => c.GlAccount)
                .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
        }

        public async Task<List<IncomeExpenseTransaction>> GetAllAsync()
        {
            return await _context.IncomeExpenseTransactions
                .Include(t => t.Category)
                    .ThenInclude(c => c.GlAccount)
                .Where(t => !t.IsDeleted)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<List<IncomeExpenseTransaction>> GetByTypeAsync(IncomeExpenseType type)
        {
            return await _context.IncomeExpenseTransactions
                .Include(t => t.Category)
                    .ThenInclude(c => c.GlAccount)
                .Where(t => t.Type == type && !t.IsDeleted)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<List<IncomeExpenseTransaction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.IncomeExpenseTransactions
                .Include(t => t.Category)
                    .ThenInclude(c => c.GlAccount)
                .Where(t => t.TransactionDate >= startDate && t.TransactionDate <= endDate && !t.IsDeleted)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<List<IncomeExpenseTransaction>> GetByCategoryAsync(Guid categoryId)
        {
            return await _context.IncomeExpenseTransactions
                .Include(t => t.Category)
                    .ThenInclude(c => c.GlAccount)
                .Where(t => t.CategoryId == categoryId && !t.IsDeleted)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<IncomeExpenseTransaction> CreateAsync(IncomeExpenseTransaction transaction)
        {
            _context.IncomeExpenseTransactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<IncomeExpenseTransaction> UpdateAsync(IncomeExpenseTransaction transaction)
        {
            _context.IncomeExpenseTransactions.Update(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var transaction = await _context.IncomeExpenseTransactions.FindAsync(id);
            if (transaction == null) return false;

            transaction.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> PostAsync(Guid id)
        {
            var transaction = await _context.IncomeExpenseTransactions.FindAsync(id);
            if (transaction == null || transaction.Status == "Posted") return false;

            transaction.Status = "Posted";
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
