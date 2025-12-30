using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Services.Product
{
    public class ItemService : IItemService
    {
        private readonly IRepository<Item> _repository;
        private readonly IRepository<UnitOfMeasure> _uomRepository;

        public ItemService(IRepository<Item> repository, IRepository<UnitOfMeasure> uomRepository)
        {
            _repository = repository;
            _uomRepository = uomRepository;
        }

        public async Task<IEnumerable<ItemDto>> GetAllAsync()
        {
            var items = await _repository.GetQueryable()
                .Include(i => i.UnitOfMeasure)
                .Include(i => i.Prices)
                    .ThenInclude(p => p.PriceList)
                .ToListAsync();

            return items.Select(i => new ItemDto
            {
                Id = i.Id,
                Name = i.Name,
                SKU = i.SKU,
                Price = i.Prices
                    .Where(p => p.PriceList != null && p.PriceList.IsDefault)
                    .OrderByDescending(p => p.EffectiveFrom)
                    .Select(p => p.Price)
                    .FirstOrDefault(),
                UnitOfMeasure = i.UnitOfMeasure != null ? new UnitOfMeasureDto
                {
                    Id = i.UnitOfMeasure.Id,
                    Name = i.UnitOfMeasure.Name,
                    Symbol = i.UnitOfMeasure.Symbol
                } : null
            }).ToList();
        }

        public async Task<ItemDetailsDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetQueryable()
                .Include(i => i.UnitOfMeasure)
                .Include(i => i.Images)
                .Include(i => i.Prices)
                    .ThenInclude(p => p.PriceList)
                .FirstOrDefaultAsync(i => i.Id == id);
            
            if (entity == null) return null;

            return new ItemDetailsDto
            {
                Id = entity.Id,
                Name = entity.Name,
                SKU = entity.SKU,
                UnitOfMeasure = new UnitOfMeasureDto
                {
                    Id = entity.UnitOfMeasure.Id,
                    Name = entity.UnitOfMeasure.Name,
                    Symbol = entity.UnitOfMeasure.Symbol
                },
                Images = entity.Images.Select(img => new ItemImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsMain = img.IsMain
                }).ToList(),
                Prices = entity.Prices.Select(p => new ItemPriceDto
                {
                    Id = p.Id,
                    Price = p.Price,
                    EffectiveFrom = p.EffectiveFrom,
                    EffectiveTo = p.EffectiveTo,
                    Item = new ItemDto { Id = p.Item.Id, Name = p.Item.Name, SKU = p.Item.SKU },
                    PriceList = new IMS.Application.DTOs.Pricing.PriceListDto { Id = p.PriceList.Id, Name = p.PriceList.Name, IsDefault = p.PriceList.IsDefault }
                }).ToList()
            };
        }

        public async Task<ItemDto> CreateAsync(CreateItemDto dto)
        {
            var entity = new Item
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                SKU = dto.SKU,
                UnitOfMeasureId = dto.UnitOfMeasureId,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new ItemDto
            {
                Id = entity.Id,
                Name = entity.Name,
                SKU = entity.SKU
            };
        }

        public async Task<ItemDto?> UpdateAsync(Guid id, CreateItemDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            if (entity.IsDeleted || !entity.IsActive) return null;

            entity.Name = dto.Name;
            entity.SKU = dto.SKU;
            entity.UnitOfMeasureId = dto.UnitOfMeasureId;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            return new ItemDto
            {
                Id = entity.Id,
                Name = entity.Name,
                SKU = entity.SKU
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
