using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public interface IItemImageManager
    {
        Task<IEnumerable<ItemImageDto>> GetAllAsync();
        Task<ItemImageDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<ItemImageDto>> GetByItemIdAsync(Guid itemId);
        Task<ItemImageDto> CreateAsync(CreateItemImageDto dto);
        Task<ItemImageDto?> UpdateAsync(Guid id, CreateItemImageDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
