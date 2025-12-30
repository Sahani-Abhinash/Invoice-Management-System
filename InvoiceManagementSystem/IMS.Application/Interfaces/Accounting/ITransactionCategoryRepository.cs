using IMS.Domain.Entities.Accounting;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Accounting
{
    public interface ITransactionCategoryRepository
    {
        Task<TransactionCategory?> GetByIdAsync(Guid id);
        Task<List<TransactionCategory>> GetAllAsync();
        Task<List<TransactionCategory>> GetByTypeAsync(IncomeExpenseType type);
        Task<TransactionCategory> CreateAsync(TransactionCategory category);
        Task<TransactionCategory> UpdateAsync(TransactionCategory category);
        Task<bool> DeleteAsync(Guid id);
    }
}
