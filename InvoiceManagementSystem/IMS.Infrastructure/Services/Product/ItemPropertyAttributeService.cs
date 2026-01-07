using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using IMS.Domain.Entities.Product;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Product
{
    public class ItemPropertyAttributeService : IItemPropertyAttributeService
    {
        private readonly AppDbContext _context;

        public ItemPropertyAttributeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ItemPropertyAttributeDto> GetByIdAsync(Guid id)
        {
            var entity = await _context.ItemPropertyAttributes
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null) throw new KeyNotFoundException($"ItemPropertyAttribute with ID {id} not found");

            return MapToDto(entity);
        }

        public async Task<List<ItemPropertyAttributeDto>> GetAllAsync()
        {
            var entities = await _context.ItemPropertyAttributes
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return entities.Select(MapToDto).ToList();
        }

        public async Task<List<ItemPropertyAttributeDto>> GetByItemIdAsync(Guid itemId)
        {
            var entities = await _context.ItemPropertyAttributes
                .Where(x => x.ItemId == itemId)
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return entities.Select(MapToDto).ToList();
        }

        public async Task<List<ItemPropertyAttributeDto>> GetByPropertyAttributeIdAsync(Guid propertyAttributeId)
        {
            var entities = await _context.ItemPropertyAttributes
                .Where(x => x.PropertyAttributeId == propertyAttributeId)
                .Include(x => x.PropertyAttribute)
                .ThenInclude(x => x.ProductProperty)
                .Include(x => x.Item)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return entities.Select(MapToDto).ToList();
        }

        public async Task<ItemPropertyAttributeDto> CreateAsync(CreateItemPropertyAttributeDto dto)
        {
            // Validate that item exists
            var itemExists = await _context.Items.AnyAsync(x => x.Id == dto.ItemId);
            if (!itemExists) throw new ArgumentException($"Item with ID {dto.ItemId} not found");

            // Validate that property attribute exists
            var attrExists = await _context.PropertyAttributes.AnyAsync(x => x.Id == dto.PropertyAttributeId);
            if (!attrExists) throw new ArgumentException($"PropertyAttribute with ID {dto.PropertyAttributeId} not found");

            var entity = new ItemPropertyAttribute
            {
                Id = Guid.NewGuid(),
                ItemId = dto.ItemId,
                PropertyAttributeId = dto.PropertyAttributeId,
                Notes = dto.Notes,
                DisplayOrder = dto.DisplayOrder
            };

            _context.ItemPropertyAttributes.Add(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.Id);
        }

        public async Task<ItemPropertyAttributeDto> UpdateAsync(UpdateItemPropertyAttributeDto dto)
        {
            var entity = await _context.ItemPropertyAttributes.FirstOrDefaultAsync(x => x.Id == dto.Id);
            if (entity == null) throw new KeyNotFoundException($"ItemPropertyAttribute with ID {dto.Id} not found");

            // Don't allow changing ItemId or PropertyAttributeId after creation
            entity.Notes = dto.Notes;
            entity.DisplayOrder = dto.DisplayOrder;

            _context.ItemPropertyAttributes.Update(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.Id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.ItemPropertyAttributes.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return false;

            _context.ItemPropertyAttributes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteByItemIdAsync(Guid itemId)
        {
            var entities = await _context.ItemPropertyAttributes
                .Where(x => x.ItemId == itemId)
                .ToListAsync();

            if (entities.Count == 0) return false;

            _context.ItemPropertyAttributes.RemoveRange(entities);
            await _context.SaveChangesAsync();
            return true;
        }

        private ItemPropertyAttributeDto MapToDto(ItemPropertyAttribute entity)
        {
            return new ItemPropertyAttributeDto
            {
                Id = entity.Id,
                ItemId = entity.ItemId,
                PropertyAttributeId = entity.PropertyAttributeId,
                PropertyName = entity.PropertyAttribute?.ProductProperty?.Name,
                PropertyAttributeName = entity.PropertyAttribute?.Value,
                AttributeValue = entity.PropertyAttribute?.Value,
                Notes = entity.Notes,
                DisplayOrder = entity.DisplayOrder
            };
        }
    }
}
