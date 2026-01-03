using IMS.Application.DTOs.Transaction;
using IMS.Application.Interfaces.Transaction;
using IMS.Domain.Entities.Transaction;
using IMS.Application.Interfaces.Common;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Transaction
{
    public class CategoryService : ICategoryService
    {
        private readonly IRepository<Category> _categoryRepo;

        public CategoryService(IRepository<Category> categoryRepo)
        {
            _categoryRepo = categoryRepo;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepo.GetAllAsync();
            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Type = c.Type,
                IsSystemCategory = c.IsSystemCategory
            });
        }

        public async Task<CategoryDto?> GetByIdAsync(Guid id)
        {
            var category = await _categoryRepo.GetByIdAsync(id);
            if (category == null) return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Type = category.Type,
                IsSystemCategory = category.IsSystemCategory
            };
        }

        public async Task<CategoryDto?> GetByNameAsync(string name)
        {
            var categories = await _categoryRepo.GetAllAsync();
            var category = categories.FirstOrDefault(c => c.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            if (category == null) return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Type = category.Type,
                IsSystemCategory = category.IsSystemCategory
            };
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                Type = dto.Type,
                IsSystemCategory = false,
                IsActive = true,
                IsDeleted = false
            };

            await _categoryRepo.AddAsync(category);
            await _categoryRepo.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Type = category.Type,
                IsSystemCategory = category.IsSystemCategory
            };
        }

        public async Task<CategoryDto> UpdateAsync(Guid id, CreateCategoryDto dto)
        {
            var category = await _categoryRepo.GetByIdAsync(id);
            if (category == null) throw new Exception("Category not found");
            if (category.IsSystemCategory) throw new Exception("Cannot update system categories");

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.Type = dto.Type;

            _categoryRepo.Update(category);
            await _categoryRepo.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Type = category.Type,
                IsSystemCategory = category.IsSystemCategory
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var category = await _categoryRepo.GetByIdAsync(id);
            if (category == null) return false;
            if (category.IsSystemCategory) return false; // Cannot delete system categories

            _categoryRepo.Delete(category);
            await _categoryRepo.SaveChangesAsync();
            return true;
        }

        public async Task<CategoryDto> GetOrCreateAsync(string name, string? description = null, bool isSystemCategory = false)
        {
            var existing = await GetByNameAsync(name);
            if (existing != null) return existing;

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = name,
                Description = description,
                Type = Domain.Enums.IncomeExpenseType.Expense, // Default to Expense for system categories
                IsSystemCategory = isSystemCategory,
                IsActive = true,
                IsDeleted = false
            };

            await _categoryRepo.AddAsync(category);
            await _categoryRepo.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Type = category.Type,
                IsSystemCategory = category.IsSystemCategory
            };
        }
    }
}
