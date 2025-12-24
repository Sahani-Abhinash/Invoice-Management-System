using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public interface IItemPriceManager
    {
        Task<IEnumerable<ItemPriceDto>> GetAllAsync();
        Task<ItemPriceDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<ItemPriceDto>> GetByItemIdAsync(Guid itemId);
        Task<IEnumerable<ItemPriceDto>> GetByPriceListIdAsync(Guid priceListId);
        Task<ItemPriceDto> CreateAsync(CreateItemPriceDto dto);
        Task<ItemPriceDto?> UpdateAsync(Guid id, CreateItemPriceDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
