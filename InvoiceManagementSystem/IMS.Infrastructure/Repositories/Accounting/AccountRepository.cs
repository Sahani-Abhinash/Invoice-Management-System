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
    public class AccountRepository : IAccountRepository
    {
        private readonly AppDbContext _context;

        public AccountRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Account?> GetByIdAsync(Guid id)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
        }

        public async Task<Account?> GetByCodeAsync(string code)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => !a.IsDeleted);
        }

        public async Task<List<Account>> GetAllAsync()
        {
            return await _context.Accounts
                .Where(a => !a.IsDeleted)
                .ToListAsync();
        }

        public async Task<List<Account>> GetByTypeAsync(AccountType accountType)
        {
            return await _context.Accounts
                .Where(a => !a.IsDeleted)
                .ToListAsync();
        }

        public async Task<Account> CreateAsync(Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<Account> UpdateAsync(Account account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null) return false;

            account.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<decimal> GetBalanceAsync(Guid accountId)
        {
            return 0;
            //var account = await _context.Accounts.FindAsync(accountId);
            //return account?.Balance ?? 0;
        }

        public async Task UpdateBalanceAsync(Guid accountId, decimal amount, bool isDebit)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account == null) return;

            //// Assets and Expenses increase with Debit
            //// Liabilities, Equity, and Revenue increase with Credit
            //var accountTypeValue = (int)account.AccountType;
            //var isAssetOrExpense = accountTypeValue >= 1 && accountTypeValue <= 199 || accountTypeValue >= 500;

            //if (isDebit)
            //{
            //    account.Balance += isAssetOrExpense ? amount : -amount;
            //}
            //else // Credit
            //{
            //    account.Balance += isAssetOrExpense ? -amount : amount;
            //}

            await _context.SaveChangesAsync();
        }
    }
}
