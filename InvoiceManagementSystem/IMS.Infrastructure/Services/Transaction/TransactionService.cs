using IMS.Application.DTOs.Transaction;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Transaction;
using IMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Transaction
{
    public class TransactionService : ITransactionService
    {
        private readonly IRepository<IMS.Domain.Entities.Transaction.Transaction> _repo;
        private readonly ICategoryService _categoryService;

        public TransactionService(
            IRepository<IMS.Domain.Entities.Transaction.Transaction> repo,
            ICategoryService categoryService)
        {
            _repo = repo;
            _categoryService = categoryService;
        }

        public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto)
        {
            var transaction = new IMS.Domain.Entities.Transaction.Transaction
            {
                Id = Guid.NewGuid(),
                TransactionDate = dto.TransactionDate,
                Type = dto.Type,
                Amount = dto.Amount,
                CategoryId = dto.CategoryId,
                Description = dto.Description,
                Reference = dto.Reference,
                SourceType = "Manual",
                SourceId = null,
                CompanyId = dto.CompanyId,
                IsActive = true,
                IsDeleted = false
            };

            await _repo.AddAsync(transaction);
            await _repo.SaveChangesAsync();

            return await MapToDtoAsync(transaction);
        }

        public async Task<IEnumerable<TransactionDto>> GetAllAsync()
        {
            var transactions = await _repo.GetAllAsync();
            var result = new List<TransactionDto>();
            foreach (var t in transactions.OrderByDescending(x => x.TransactionDate))
            {
                result.Add(await MapToDtoAsync(t));
            }
            return result;
        }

        public async Task<TransactionDto?> GetByIdAsync(Guid id)
        {
            var transaction = await _repo.GetByIdAsync(id);
            return transaction == null ? null : await MapToDtoAsync(transaction);
        }

        public async Task<IEnumerable<TransactionDto>> GetBySourceAsync(string sourceType, string sourceId)
        {
            var transactions = await _repo.GetAllAsync();
            var filtered = transactions
                .Where(t => t.SourceType == sourceType && t.SourceId == sourceId)
                .OrderByDescending(t => t.TransactionDate);

            var result = new List<TransactionDto>();
            foreach (var t in filtered)
            {
                result.Add(await MapToDtoAsync(t));
            }
            return result;
        }

        public async Task<IEnumerable<TransactionDto>> GetByCategoryAsync(string category)
        {
            var categoryDto = await _categoryService.GetByNameAsync(category);
            if (categoryDto == null) return new List<TransactionDto>();

            var transactions = await _repo.GetAllAsync();
            var filtered = transactions
                .Where(t => t.CategoryId == categoryDto.Id)
                .OrderByDescending(t => t.TransactionDate);

            var result = new List<TransactionDto>();
            foreach (var t in filtered)
            {
                result.Add(await MapToDtoAsync(t));
            }
            return result;
        }

        public async Task<TransactionSummaryDto> GetSummaryAsync()
        {
            var transactions = await _repo.GetAllAsync();
            
            var summary = new TransactionSummaryDto
            {
                TotalDebits = transactions.Where(t => t.Type == TransactionType.Debit).Sum(t => t.Amount),
                TotalCredits = transactions.Where(t => t.Type == TransactionType.Credit).Sum(t => t.Amount),
                TotalTransactions = transactions.Count()
            };

            return summary;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var transaction = await _repo.GetByIdAsync(id);
            if (transaction == null || transaction.SourceType != "Manual")
                return false; // Only manual transactions can be deleted

            _repo.Delete(transaction);
            await _repo.SaveChangesAsync();
            return true;
        }

        private async Task<TransactionDto> MapToDtoAsync(IMS.Domain.Entities.Transaction.Transaction t)
        {
            var category = await _categoryService.GetByIdAsync(t.CategoryId);
            
            return new TransactionDto
            {
                Id = t.Id,
                TransactionDate = t.TransactionDate,
                Type = t.Type,
                Amount = t.Amount,
                CategoryId = t.CategoryId,
                CategoryName = category?.Name ?? "Unknown",
                Description = t.Description,
                Reference = t.Reference,
                SourceType = t.SourceType,
                SourceId = t.SourceId,
                CompanyId = t.CompanyId
            };
        }

        // Helper method to create transaction from source (GRN/Invoice)
        public async Task<TransactionDto> CreateFromSourceAsync(
            Guid sourceId,
            string sourceType,
            TransactionType type,
            decimal amount,
            string categoryName,
            string description)
        {
            // Get or create category
            var category = await _categoryService.GetOrCreateAsync(categoryName, null, true);

            var transaction = new IMS.Domain.Entities.Transaction.Transaction
            {
                Id = Guid.NewGuid(),
                TransactionDate = DateTime.UtcNow,
                Type = type,
                Amount = amount,
                CategoryId = category.Id,
                Description = description,
                Reference = $"{sourceType}-{sourceId}",
                SourceType = sourceType,
                SourceId = sourceId.ToString(),
                IsActive = true,
                IsDeleted = false
            };

            await _repo.AddAsync(transaction);
            await _repo.SaveChangesAsync();

            return await MapToDtoAsync(transaction);
        }
    }
}
