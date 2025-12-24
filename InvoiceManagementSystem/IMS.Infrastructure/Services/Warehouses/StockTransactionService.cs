using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Warehouse;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Warehouses
{
    public class StockTransactionService : IStockTransactionService
    {
        private readonly IRepository<StockTransaction> _repository;

        public StockTransactionService(IRepository<StockTransaction> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<StockTransactionDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(s => new StockTransactionDto
            {
                Id = s.Id,
                ItemId = s.ItemId,
                WarehouseId = s.WarehouseId,
                Quantity = s.Quantity,
                TransactionType = s.TransactionType.ToString(),
                Reference = s.Reference
            }).ToList();
        }

        public async Task<StockTransactionDto?> GetByIdAsync(Guid id)
        {
            var s = await _repository.GetByIdAsync(id);
            if (s == null) return null;
            return new StockTransactionDto
            {
                Id = s.Id,
                ItemId = s.ItemId,
                WarehouseId = s.WarehouseId,
                Quantity = s.Quantity,
                TransactionType = s.TransactionType.ToString(),
                Reference = s.Reference
            };
        }

        public async Task<IEnumerable<StockTransactionDto>> GetByWarehouseIdAsync(Guid warehouseId)
        {
            var list = await _repository.GetAllAsync();
            list = list.Where(l => l.WarehouseId == warehouseId);
            return list.Select(s => new StockTransactionDto
            {
                Id = s.Id,
                ItemId = s.ItemId,
                WarehouseId = s.WarehouseId,
                Quantity = s.Quantity,
                TransactionType = s.TransactionType.ToString(),
                Reference = s.Reference
            }).ToList();
        }

        public async Task<IEnumerable<StockTransactionDto>> GetByItemIdAsync(Guid itemId)
        {
            var list = await _repository.GetAllAsync();
            list = list.Where(l => l.ItemId == itemId);
            return list.Select(s => new StockTransactionDto
            {
                Id = s.Id,
                ItemId = s.ItemId,
                WarehouseId = s.WarehouseId,
                Quantity = s.Quantity,
                TransactionType = s.TransactionType.ToString(),
                Reference = s.Reference
            }).ToList();
        }

        public async Task<StockTransactionDto> CreateAsync(CreateStockTransactionDto dto)
        {
            var entity = new StockTransaction
            {
                Id = Guid.NewGuid(),
                ItemId = dto.ItemId,
                WarehouseId = dto.WarehouseId,
                Quantity = dto.Quantity,
                TransactionType = dto.TransactionType,
                Reference = dto.Reference,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new StockTransactionDto
            {
                Id = entity.Id,
                ItemId = entity.ItemId,
                WarehouseId = entity.WarehouseId,
                Quantity = entity.Quantity,
                TransactionType = entity.TransactionType.ToString(),
                Reference = entity.Reference
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;
            if (entity.IsDeleted) return false;

            _repository.Delete(entity);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
