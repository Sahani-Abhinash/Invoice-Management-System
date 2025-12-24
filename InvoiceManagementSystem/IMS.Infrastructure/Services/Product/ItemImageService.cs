using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Product
{
    public class ItemImageService : IItemImageService
    {
        private readonly IRepository<ItemImage> _repository;
        private readonly IRepository<Item> _itemRepository;

        public ItemImageService(IRepository<ItemImage> repository, IRepository<Item> itemRepository)
        {
            _repository = repository;
            _itemRepository = itemRepository;
        }

        public async Task<IEnumerable<ItemImageDto>> GetAllAsync()
        {
            var images = await _repository.GetAllAsync(i => i.Item);
            return images.Select(i => new ItemImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                IsMain = i.IsMain
            }).ToList();
        }

        public async Task<ItemImageDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id, i => i.Item);
            if (entity == null) return null;
            return new ItemImageDto
            {
                Id = entity.Id,
                ImageUrl = entity.ImageUrl,
                IsMain = entity.IsMain
            };
        }

        public async Task<IEnumerable<ItemImageDto>> GetByItemIdAsync(Guid itemId)
        {
            var images = await _repository.GetAllAsync(i => i.Item);
            images = images.Where(i => i.ItemId == itemId);
            return images.Select(i => new ItemImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                IsMain = i.IsMain
            }).ToList();
        }

        public async Task<ItemImageDto> CreateAsync(CreateItemImageDto dto)
        {
            var entity = new ItemImage
            {
                Id = Guid.NewGuid(),
                ItemId = dto.ItemId,
                ImageUrl = dto.ImageUrl,
                IsMain = dto.IsMain,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new ItemImageDto
            {
                Id = entity.Id,
                ImageUrl = entity.ImageUrl,
                IsMain = entity.IsMain
            };
        }

        public async Task<ItemImageDto?> UpdateAsync(Guid id, CreateItemImageDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            if (entity.IsDeleted || !entity.IsActive) return null;

            entity.ItemId = dto.ItemId;
            entity.ImageUrl = dto.ImageUrl;
            entity.IsMain = dto.IsMain;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            return new ItemImageDto
            {
                Id = entity.Id,
                ImageUrl = entity.ImageUrl,
                IsMain = entity.IsMain
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
