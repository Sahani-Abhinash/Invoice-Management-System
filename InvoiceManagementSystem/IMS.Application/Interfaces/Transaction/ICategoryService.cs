using IMS.Application.DTOs.Transaction;

namespace IMS.Application.Interfaces.Transaction
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(Guid id);
        Task<CategoryDto?> GetByNameAsync(string name);
        Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
        Task<CategoryDto> UpdateAsync(Guid id, CreateCategoryDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<CategoryDto> GetOrCreateAsync(string name, string? description = null, bool isSystemCategory = false);
    }
}
