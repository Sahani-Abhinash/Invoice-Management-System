using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Product
{
    public interface IItemService
    {
        Task<IEnumerable<ItemDto>> GetAllAsync();
        Task<ItemDetailsDto?> GetByIdAsync(Guid id);
        Task<ItemDto> CreateAsync(CreateItemDto dto);
        Task<ItemDto?> UpdateAsync(Guid id, CreateItemDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
