using IMS.Domain.Entities.Accounting;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Accounting
{
    public interface IIncomeExpenseTransactionRepository
    {
        Task<IncomeExpenseTransaction?> GetByIdAsync(Guid id);
        Task<List<IncomeExpenseTransaction>> GetAllAsync();
        Task<List<IncomeExpenseTransaction>> GetByTypeAsync(IncomeExpenseType type);
        Task<List<IncomeExpenseTransaction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<List<IncomeExpenseTransaction>> GetByCategoryAsync(Guid categoryId);
        Task<IncomeExpenseTransaction> CreateAsync(IncomeExpenseTransaction transaction);
        Task<IncomeExpenseTransaction> UpdateAsync(IncomeExpenseTransaction transaction);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> PostAsync(Guid id);
    }
}
