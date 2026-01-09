using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Product
{
    public interface IItemPriceVariantService
    {
        Task<ItemPriceVariantDto> GetByIdAsync(Guid id);
        Task<List<ItemPriceVariantDto>> GetAllAsync();
        Task<List<ItemPriceVariantDto>> GetByItemPriceIdAsync(Guid itemPriceId);
        Task<List<ItemPriceVariantDto>> GetByPropertyAttributeIdAsync(Guid propertyAttributeId);
        Task<ItemPriceVariantDto> CreateAsync(CreateItemPriceVariantDto dto);
        Task<ItemPriceVariantDto> UpdateAsync(UpdateItemPriceVariantDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteByItemPriceIdAsync(Guid itemPriceId);
    }
}
