using IMS.Application.DTOs.Transaction;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Transaction
{
    public interface ITransactionService
    {
        Task<TransactionDto> CreateAsync(CreateTransactionDto dto);
        Task<IEnumerable<TransactionDto>> GetAllAsync();
        Task<TransactionDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<TransactionDto>> GetBySourceAsync(string sourceType, string sourceId);
        Task<IEnumerable<TransactionDto>> GetByCategoryAsync(string category);
        Task<TransactionSummaryDto> GetSummaryAsync();
        Task<bool> DeleteAsync(Guid id);
        Task<TransactionDto> CreateFromSourceAsync(Guid sourceId, string sourceType, TransactionType type, decimal amount, string categoryName, string description);
    }
}
