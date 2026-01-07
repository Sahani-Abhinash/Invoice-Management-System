using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Product;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Product
{
    public class PropertyAttributeService : IPropertyAttributeService
    {
        private readonly IRepository<PropertyAttribute> _repository;
        private readonly IRepository<ProductProperty> _propertyRepository;

        public PropertyAttributeService(
            IRepository<PropertyAttribute> repository,
            IRepository<ProductProperty> propertyRepository)
        {
            _repository = repository;
            _propertyRepository = propertyRepository;
        }

        public async Task<IEnumerable<PropertyAttributeDto>> GetAllAsync()
        {
            var items = await _repository.GetAllAsync(x => x.ProductProperty);
            return items.Select(i => new PropertyAttributeDto
            {
                Id = i.Id,
                ProductPropertyId = i.ProductPropertyId,
                ProductPropertyName = i.ProductProperty?.Name ?? string.Empty,
                Value = i.Value,
                Description = i.Description,
                DisplayOrder = i.DisplayOrder,
                Metadata = i.Metadata
            }).OrderBy(x => x.DisplayOrder).ToList();
        }

        public async Task<IEnumerable<PropertyAttributeDto>> GetByPropertyIdAsync(Guid propertyId)
        {
            var items = await _repository.GetAllAsync(x => x.ProductProperty);
            return items
                .Where(x => x.ProductPropertyId == propertyId)
                .Select(i => new PropertyAttributeDto
                {
                    Id = i.Id,
                    ProductPropertyId = i.ProductPropertyId,
                    ProductPropertyName = i.ProductProperty?.Name ?? string.Empty,
                    Value = i.Value,
                    Description = i.Description,
                    DisplayOrder = i.DisplayOrder,
                    Metadata = i.Metadata
                }).OrderBy(x => x.DisplayOrder).ToList();
        }

        public async Task<PropertyAttributeDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id, x => x.ProductProperty);
            if (entity == null) return null;
            return new PropertyAttributeDto
            {
                Id = entity.Id,
                ProductPropertyId = entity.ProductPropertyId,
                ProductPropertyName = entity.ProductProperty?.Name ?? string.Empty,
                Value = entity.Value,
                Description = entity.Description,
                DisplayOrder = entity.DisplayOrder,
                Metadata = entity.Metadata
            };
        }

        public async Task<PropertyAttributeDto> CreateAsync(CreatePropertyAttributeDto dto)
        {
            // Validate that the property exists
            var property = await _propertyRepository.GetByIdAsync(dto.ProductPropertyId);
            if (property == null)
            {
                throw new ArgumentException($"Product property with ID {dto.ProductPropertyId} not found.");
            }

            var entity = new PropertyAttribute
            {
                Id = Guid.NewGuid(),
                ProductPropertyId = dto.ProductPropertyId,
                Value = dto.Value,
                Description = dto.Description,
                DisplayOrder = dto.DisplayOrder,
                Metadata = dto.Metadata,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            // Reload with navigation property
            var created = await _repository.GetByIdAsync(entity.Id, x => x.ProductProperty);

            return new PropertyAttributeDto
            {
                Id = created!.Id,
                ProductPropertyId = created.ProductPropertyId,
                ProductPropertyName = created.ProductProperty?.Name ?? string.Empty,
                Value = created.Value,
                Description = created.Description,
                DisplayOrder = created.DisplayOrder,
                Metadata = created.Metadata
            };
        }

        public async Task<PropertyAttributeDto?> UpdateAsync(Guid id, CreatePropertyAttributeDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;

            // Validate that the property exists if changing
            if (entity.ProductPropertyId != dto.ProductPropertyId)
            {
                var property = await _propertyRepository.GetByIdAsync(dto.ProductPropertyId);
                if (property == null)
                {
                    throw new ArgumentException($"Product property with ID {dto.ProductPropertyId} not found.");
                }
            }

            entity.ProductPropertyId = dto.ProductPropertyId;
            entity.Value = dto.Value;
            entity.Description = dto.Description;
            entity.DisplayOrder = dto.DisplayOrder;
            entity.Metadata = dto.Metadata;
            entity.UpdatedAt = DateTime.UtcNow;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            // Reload with navigation property
            var updated = await _repository.GetByIdAsync(id, x => x.ProductProperty);

            return new PropertyAttributeDto
            {
                Id = updated!.Id,
                ProductPropertyId = updated.ProductPropertyId,
                ProductPropertyName = updated.ProductProperty?.Name ?? string.Empty,
                Value = updated.Value,
                Description = updated.Description,
                DisplayOrder = updated.DisplayOrder,
                Metadata = updated.Metadata
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
