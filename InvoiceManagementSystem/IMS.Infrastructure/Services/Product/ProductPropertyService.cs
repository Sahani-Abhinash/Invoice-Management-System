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
    public class ProductPropertyService : IProductPropertyService
    {
        private readonly IRepository<ProductProperty> _repository;

        public ProductPropertyService(IRepository<ProductProperty> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ProductPropertyDto>> GetAllAsync()
        {
            var items = await _repository.GetAllAsync();
            return items.Select(i => new ProductPropertyDto
            {
                Id = i.Id,
                Name = i.Name,
                Description = i.Description,
                DisplayOrder = i.DisplayOrder
            }).OrderBy(x => x.DisplayOrder).ToList();
        }

        public async Task<ProductPropertyDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            return new ProductPropertyDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                DisplayOrder = entity.DisplayOrder
            };
        }

        public async Task<ProductPropertyDto> CreateAsync(CreateProductPropertyDto dto)
        {
            var entity = new ProductProperty
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                DisplayOrder = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new ProductPropertyDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                DisplayOrder = entity.DisplayOrder
            };
        }

        public async Task<ProductPropertyDto?> UpdateAsync(Guid id, CreateProductPropertyDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;

            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.DisplayOrder = dto.DisplayOrder;
            entity.UpdatedAt = DateTime.UtcNow;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            return new ProductPropertyDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                DisplayOrder = entity.DisplayOrder
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            _repository.Delete(entity);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
