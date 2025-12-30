using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Warehouse;
using IMS.Domain.Entities.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Services.Warehouses
{
    public class StockService : IStockService
    {
        private readonly IRepository<Stock> _repository;
        private readonly IRepository<Item> _itemRepository;
        private readonly IRepository<Warehouse> _warehouseRepository;
        private readonly IMS.Application.Interfaces.Common.IAddressService _addressService;

        public StockService(IRepository<Stock> repository, IRepository<Item> itemRepository, IRepository<Warehouse> warehouseRepository, IMS.Application.Interfaces.Common.IAddressService addressService)
        {
            _repository = repository;
            _itemRepository = itemRepository;
            _warehouseRepository = warehouseRepository;
            _addressService = addressService;
        }

        public async Task<IEnumerable<StockDto>> GetAllAsync()
        {
            try 
            {
                var stocks = await _repository.GetQueryable()
                    .Include(s => s.Item)
                    .Include(s => s.Warehouse)
                        .ThenInclude(w => w.Branch)
                    .Where(s => s.IsActive && !s.IsDeleted)
                    .ToListAsync();

                var result = new List<StockDto>();
                foreach (var s in stocks)
                {
                    if (s.Item != null && s.Warehouse != null && s.Warehouse.Branch != null)
                    {
                        result.Add(await MapToDtoAsync(s, s.Item, s.Warehouse));
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("StockService.GetAllAsync Error: " + ex.Message);
                return new List<StockDto>();
            }
        }

        public async Task<StockDto?> GetByIdAsync(Guid id)
        {
            try
            {
                var entity = await _repository.GetQueryable()
                    .Include(s => s.Item)
                    .Include(s => s.Warehouse)
                        .ThenInclude(w => w.Branch)
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsActive && !s.IsDeleted);

                if (entity == null || entity.Item == null || entity.Warehouse == null || entity.Warehouse.Branch == null) return null;
                return await MapToDtoAsync(entity, entity.Item, entity.Warehouse);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"StockService.GetByIdAsync Error: {ex.Message}");
                return null;
            }
        }

        public async Task<IEnumerable<StockDto>> GetByWarehouseIdAsync(Guid warehouseId)
        {
            try
            {
                var stocks = await _repository.GetQueryable()
                    .Include(s => s.Item)
                    .Include(s => s.Warehouse)
                        .ThenInclude(w => w.Branch)
                    .Where(s => s.WarehouseId == warehouseId && s.IsActive && !s.IsDeleted)
                    .ToListAsync();

                var result = new List<StockDto>();
                foreach (var s in stocks)
                {
                    if (s.Item != null && s.Warehouse != null && s.Warehouse.Branch != null)
                    {
                        result.Add(await MapToDtoAsync(s, s.Item, s.Warehouse));
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"StockService.GetByWarehouseIdAsync Error: {ex.Message}");
                return new List<StockDto>();
            }
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
            var warehouse = await _warehouseRepository.GetByIdAsync(entity.WarehouseId, w => w.Branch);
            return await MapToDtoAsync(entity, item!, warehouse!);
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
            var warehouse = await _warehouseRepository.GetByIdAsync(entity.WarehouseId, w => w.Branch);
            return await MapToDtoAsync(entity, item!, warehouse!);
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

        private async Task<StockDto> MapToDtoAsync(Stock s, Item i, Warehouse w)
        {
            // Simplified mapping to avoid expensive N+1 address queries
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
                        AddressId = null,
                        Address = null
                    }
                }
            };
        }
    }
}
