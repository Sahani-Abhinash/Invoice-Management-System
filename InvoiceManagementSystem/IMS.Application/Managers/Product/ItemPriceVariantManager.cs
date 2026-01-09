using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public interface IItemPriceVariantManager
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

    public class ItemPriceVariantManager : IItemPriceVariantManager
    {
        private readonly IItemPriceVariantService _service;

        public ItemPriceVariantManager(IItemPriceVariantService service)
        {
            _service = service;
        }

        public async Task<ItemPriceVariantDto> GetByIdAsync(Guid id)
        {
            return await _service.GetByIdAsync(id);
        }

        public async Task<List<ItemPriceVariantDto>> GetAllAsync()
        {
            return await _service.GetAllAsync();
        }

        public async Task<List<ItemPriceVariantDto>> GetByItemPriceIdAsync(Guid itemPriceId)
        {
            return await _service.GetByItemPriceIdAsync(itemPriceId);
        }

        public async Task<List<ItemPriceVariantDto>> GetByPropertyAttributeIdAsync(Guid propertyAttributeId)
        {
            return await _service.GetByPropertyAttributeIdAsync(propertyAttributeId);
        }

        public async Task<ItemPriceVariantDto> CreateAsync(CreateItemPriceVariantDto dto)
        {
            return await _service.CreateAsync(dto);
        }

        public async Task<ItemPriceVariantDto> UpdateAsync(UpdateItemPriceVariantDto dto)
        {
            return await _service.UpdateAsync(dto);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _service.DeleteAsync(id);
        }

        public async Task<bool> DeleteByItemPriceIdAsync(Guid itemPriceId)
        {
            return await _service.DeleteByItemPriceIdAsync(itemPriceId);
        }
    }
}
