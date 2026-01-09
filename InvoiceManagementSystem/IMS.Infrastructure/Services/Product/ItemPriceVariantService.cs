using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using IMS.Domain.Entities.Product;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Product
{
    public class ItemPriceVariantService : IItemPriceVariantService
    {
        private readonly AppDbContext _context;

        public ItemPriceVariantService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ItemPriceVariantDto> GetByIdAsync(Guid id)
        {
            var entity = await _context.ItemPriceVariants
                .Include(x => x.ItemPrice)
                .ThenInclude(x => x.Item)
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                throw new KeyNotFoundException($"ItemPriceVariant with ID {id} not found");

            return MapToDto(entity);
        }

        public async Task<List<ItemPriceVariantDto>> GetAllAsync()
        {
            var entities = await _context.ItemPriceVariants
                .Include(x => x.ItemPrice)
                .ThenInclude(x => x.Item)
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return entities.Select(MapToDto).ToList();
        }

        public async Task<List<ItemPriceVariantDto>> GetByItemPriceIdAsync(Guid itemPriceId)
        {
            var entities = await _context.ItemPriceVariants
                .Include(x => x.ItemPrice)
                .ThenInclude(x => x.Item)
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .Where(x => x.ItemPriceId == itemPriceId && !x.IsDeleted)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return entities.Select(MapToDto).ToList();
        }

        public async Task<List<ItemPriceVariantDto>> GetByPropertyAttributeIdAsync(Guid propertyAttributeId)
        {
            var entities = await _context.ItemPriceVariants
                .Include(x => x.ItemPrice)
                .ThenInclude(x => x.Item)
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .Where(x => x.PropertyAttributeId == propertyAttributeId && !x.IsDeleted)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return entities.Select(MapToDto).ToList();
        }

        public async Task<ItemPriceVariantDto> CreateAsync(CreateItemPriceVariantDto dto)
        {
            // Validate that ItemPrice exists
            var itemPrice = await _context.ItemPrices.FindAsync(dto.ItemPriceId);
            if (itemPrice == null || itemPrice.IsDeleted)
                throw new KeyNotFoundException($"ItemPrice with ID {dto.ItemPriceId} not found");

            // Validate that PropertyAttribute exists
            var propertyAttribute = await _context.PropertyAttributes.FindAsync(dto.PropertyAttributeId);
            if (propertyAttribute == null || propertyAttribute.IsDeleted)
                throw new KeyNotFoundException($"PropertyAttribute with ID {dto.PropertyAttributeId} not found");

            // Check for duplicate variant combination
            var existingVariant = await _context.ItemPriceVariants
                .FirstOrDefaultAsync(x => x.ItemPriceId == dto.ItemPriceId && 
                                         x.PropertyAttributeId == dto.PropertyAttributeId &&
                                         !x.IsDeleted);

            if (existingVariant != null)
                throw new InvalidOperationException("This variant combination already exists for this price");

            var entity = new ItemPriceVariant
            {
                Id = Guid.NewGuid(),
                ItemPriceId = dto.ItemPriceId,
                PropertyAttributeId = dto.PropertyAttributeId,
                DisplayOrder = dto.DisplayOrder,
                StockQuantity = dto.StockQuantity,
                VariantSKU = dto.VariantSKU,
                IsDeleted = false
            };

            await _context.ItemPriceVariants.AddAsync(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.Id);
        }

        public async Task<ItemPriceVariantDto> UpdateAsync(UpdateItemPriceVariantDto dto)
        {
            var entity = await _context.ItemPriceVariants
                .Include(x => x.ItemPrice)
                .ThenInclude(x => x.Item)
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .FirstOrDefaultAsync(x => x.Id == dto.Id && !x.IsDeleted);

            if (entity == null)
                throw new KeyNotFoundException($"ItemPriceVariant with ID {dto.Id} not found");

            // ItemPriceId cannot be changed (it's the primary key reference)
            if (entity.ItemPriceId != dto.ItemPriceId)
            {
                throw new InvalidOperationException(
                    "Cannot modify the ItemPrice for an existing variant. " +
                    "Please delete this variant and create a new one with the desired ItemPrice.");
            }

            // Validate new PropertyAttribute if changed
            if (entity.PropertyAttributeId != dto.PropertyAttributeId)
            {
                var propertyAttribute = await _context.PropertyAttributes.FindAsync(dto.PropertyAttributeId);
                if (propertyAttribute == null || propertyAttribute.IsDeleted)
                    throw new KeyNotFoundException($"PropertyAttribute with ID {dto.PropertyAttributeId} not found");
            }

            // Update all fields including PropertyAttributeId
            entity.PropertyAttributeId = dto.PropertyAttributeId;
            entity.DisplayOrder = dto.DisplayOrder;
            entity.StockQuantity = dto.StockQuantity;
            entity.VariantSKU = dto.VariantSKU;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.ItemPriceVariants.Update(entity);
            await _context.SaveChangesAsync();

            // Return the DTO directly from the tracked entity with fresh navigation data
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.ItemPriceVariants
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;

            _context.ItemPriceVariants.Update(entity);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteByItemPriceIdAsync(Guid itemPriceId)
        {
            var entities = await _context.ItemPriceVariants
                .Where(x => x.ItemPriceId == itemPriceId && !x.IsDeleted)
                .ToListAsync();

            if (entities.Count == 0)
                return false;

            foreach (var entity in entities)
            {
                entity.IsDeleted = true;
                entity.DeletedAt = DateTime.UtcNow;
            }

            _context.ItemPriceVariants.UpdateRange(entities);
            await _context.SaveChangesAsync();

            return true;
        }

        private ItemPriceVariantDto MapToDto(ItemPriceVariant entity)
        {
            return new ItemPriceVariantDto
            {
                Id = entity.Id,
                ItemPriceId = entity.ItemPriceId,
                PropertyAttributeId = entity.PropertyAttributeId,
                PropertyName = entity.PropertyAttribute?.ProductProperty?.Name,
                AttributeValue = entity.PropertyAttribute?.Value,
                DisplayLabel = $"{entity.PropertyAttribute?.ProductProperty?.Name}: {entity.PropertyAttribute?.Value}",
                DisplayOrder = entity.DisplayOrder,
                StockQuantity = entity.StockQuantity,
                VariantSKU = entity.VariantSKU,
                Price = entity.ItemPrice?.Price,
                ItemName = entity.ItemPrice?.Item?.Name
            };
        }
    }
}
