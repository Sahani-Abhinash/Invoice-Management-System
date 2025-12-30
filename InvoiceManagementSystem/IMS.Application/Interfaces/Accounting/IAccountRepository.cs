using IMS.Domain.Entities.Accounting;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Accounting
{
    public interface IAccountRepository
    {
        Task<Account?> GetByIdAsync(Guid id);
        Task<Account?> GetByCodeAsync(string code);
        Task<List<Account>> GetAllAsync();
        Task<List<Account>> GetByTypeAsync(AccountType accountType);
        Task<Account> CreateAsync(Account account);
        Task<Account> UpdateAsync(Account account);
        Task<bool> DeleteAsync(Guid id);
        Task<decimal> GetBalanceAsync(Guid accountId);
        Task UpdateBalanceAsync(Guid accountId, decimal amount, bool isDebit);
    }
}
