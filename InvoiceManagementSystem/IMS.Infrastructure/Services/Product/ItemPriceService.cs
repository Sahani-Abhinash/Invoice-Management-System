using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Product;
using IMS.Domain.Entities.Pricing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Product
{
    public class ItemPriceService : IItemPriceService
    {
        private readonly IRepository<ItemPrice> _repository;
        private readonly IRepository<Item> _itemRepository;
        private readonly IRepository<PriceList> _priceListRepository;

        public ItemPriceService(IRepository<ItemPrice> repository, IRepository<Item> itemRepository, IRepository<PriceList> priceListRepository)
        {
            _repository = repository;
            _itemRepository = itemRepository;
            _priceListRepository = priceListRepository;
        }

        public async Task<IEnumerable<ItemPriceDto>> GetAllAsync()
        {
            var items = await _repository.GetAllAsync(ip => ip.Item, ip => ip.PriceList);
            return items.Select(ip => MapToDto(ip, ip.Item!, ip.PriceList!)).ToList();
        }

        public async Task<ItemPriceDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id, ip => ip.Item, ip => ip.PriceList);
            if (entity == null) return null;
            return MapToDto(entity, entity.Item!, entity.PriceList!);
        }

        public async Task<IEnumerable<ItemPriceDto>> GetByItemIdAsync(Guid itemId)
        {
            var items = await _repository.GetAllAsync(ip => ip.Item, ip => ip.PriceList);
            items = items.Where(ip => ip.ItemId == itemId);
            return items.Select(ip => MapToDto(ip, ip.Item!, ip.PriceList!)).ToList();
        }

        public async Task<IEnumerable<ItemPriceDto>> GetByPriceListIdAsync(Guid priceListId)
        {
            var items = await _repository.GetAllAsync(ip => ip.Item, ip => ip.PriceList);
            items = items.Where(ip => ip.PriceListId == priceListId);
            return items.Select(ip => MapToDto(ip, ip.Item!, ip.PriceList!)).ToList();
        }

        public async Task<ItemPriceDto> CreateAsync(CreateItemPriceDto dto)
        {
            var entity = new ItemPrice
            {
                Id = Guid.NewGuid(),
                ItemId = dto.ItemId,
                PriceListId = dto.PriceListId,
                Price = dto.Price,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            var item = await _itemRepository.GetByIdAsync(entity.ItemId);
            var priceList = await _priceListRepository.GetByIdAsync(entity.PriceListId);
            return MapToDto(entity, item!, priceList!);
        }

        public async Task<ItemPriceDto?> UpdateAsync(Guid id, CreateItemPriceDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            if (entity.IsDeleted || !entity.IsActive) return null;

            entity.ItemId = dto.ItemId;
            entity.PriceListId = dto.PriceListId;
            entity.Price = dto.Price;
            entity.EffectiveFrom = dto.EffectiveFrom;
            entity.EffectiveTo = dto.EffectiveTo;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            var item = await _itemRepository.GetByIdAsync(entity.ItemId);
            var priceList = await _priceListRepository.GetByIdAsync(entity.PriceListId);
            return MapToDto(entity, item!, priceList!);
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

        private ItemPriceDto MapToDto(ItemPrice ip, Item i, PriceList p)
        {
            return new ItemPriceDto
            {
                Id = ip.Id,
                Price = ip.Price,
                EffectiveFrom = ip.EffectiveFrom,
                EffectiveTo = ip.EffectiveTo,
                Item = new ItemDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    SKU = i.SKU
                },
                PriceList = new IMS.Application.DTOs.Pricing.PriceListDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    IsDefault = p.IsDefault
                }
            };
        }
    }
}
