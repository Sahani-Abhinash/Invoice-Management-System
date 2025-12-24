using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Warehouse;
using IMS.Domain.Entities.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Warehouses
{
    public class StockService : IStockService
    {
        private readonly IRepository<Stock> _repository;
        private readonly IRepository<Item> _itemRepository;
        private readonly IRepository<Warehouse> _warehouseRepository;

        public StockService(IRepository<Stock> repository, IRepository<Item> itemRepository, IRepository<Warehouse> warehouseRepository)
        {
            _repository = repository;
            _itemRepository = itemRepository;
            _warehouseRepository = warehouseRepository;
        }

        public async Task<IEnumerable<StockDto>> GetAllAsync()
        {
            var stocks = await _repository.GetAllAsync(s => s.Item, s => s.Warehouse);
            return stocks.Select(s => MapToDto(s, s.Item!, s.Warehouse!)).ToList();
        }

        public async Task<StockDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id, s => s.Item, s => s.Warehouse);
            if (entity == null) return null;
            return MapToDto(entity, entity.Item!, entity.Warehouse!);
        }

        public async Task<IEnumerable<StockDto>> GetByWarehouseIdAsync(Guid warehouseId)
        {
            var stocks = await _repository.GetAllAsync(s => s.Item, s => s.Warehouse);
            stocks = stocks.Where(s => s.WarehouseId == warehouseId);
            return stocks.Select(s => MapToDto(s, s.Item!, s.Warehouse!)).ToList();
        }

        public async Task<StockDto> CreateAsync(CreateStockDto dto)
        {
            var entity = new Stock
            {
                Id = Guid.NewGuid(),
                ItemId = dto.ItemId,
                WarehouseId = dto.WarehouseId,
                Quantity = dto.Quantity,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            var item = await _itemRepository.GetByIdAsync(entity.ItemId);
            var warehouse = await _warehouseRepository.GetByIdAsync(entity.WarehouseId);
            return MapToDto(entity, item!, warehouse!);
        }

        public async Task<StockDto?> UpdateAsync(Guid id, CreateStockDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            if (entity.IsDeleted || !entity.IsActive) return null;

            entity.ItemId = dto.ItemId;
            entity.WarehouseId = dto.WarehouseId;
            entity.Quantity = dto.Quantity;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            var item = await _itemRepository.GetByIdAsync(entity.ItemId);
            var warehouse = await _warehouseRepository.GetByIdAsync(entity.WarehouseId);
            return MapToDto(entity, item!, warehouse!);
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

        private StockDto MapToDto(Stock s, Item i, Warehouse w)
        {
            return new StockDto
            {
                Id = s.Id,
                Quantity = s.Quantity,
                Item = new IMS.Application.DTOs.Product.ItemDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    SKU = i.SKU
                },
                Warehouse = new IMS.Application.DTOs.Warehouses.WarehouseDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Branch = new IMS.Application.DTOs.Companies.BranchDto
                    {
                        Id = w.Branch.Id,
                        Name = w.Branch.Name,
                        Address = w.Branch.Address,
                        Company = new IMS.Application.DTOs.Companies.CompanyDto
                        {
                            Id = w.Branch.Company.Id,
                            Name = w.Branch.Company.Name,
                            TaxNumber = w.Branch.Company.TaxNumber
                        }
                    }
                }
            };
        }
    }
}
