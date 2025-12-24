using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public interface IItemManager
    {
        Task<IEnumerable<ItemDto>> GetAllAsync();
        Task<ItemDetailsDto?> GetByIdAsync(Guid id);
        Task<ItemDto> CreateAsync(CreateItemDto dto);
        Task<ItemDto?> UpdateAsync(Guid id, CreateItemDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
