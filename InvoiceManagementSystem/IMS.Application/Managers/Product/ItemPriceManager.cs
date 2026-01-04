using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public class ItemPriceManager : IItemPriceManager
    {
        private readonly IItemPriceService _service;

        public ItemPriceManager(IItemPriceService service)
        {
            _service = service;
        }

        public async Task<IEnumerable<ItemPriceDto>> GetAllAsync() => await _service.GetAllAsync();

        public async Task<ItemPriceDto?> GetByIdAsync(Guid id) => await _service.GetByIdAsync(id);

        public async Task<IEnumerable<ItemPriceDto>> GetByItemIdAsync(Guid itemId) => await _service.GetByItemIdAsync(itemId);

        public async Task<IEnumerable<ItemPriceDto>> GetByPriceListIdAsync(Guid priceListId) => await _service.GetByPriceListIdAsync(priceListId);

        public async Task<IEnumerable<ItemWithPricesDto>> GetItemsWithPricesForPriceListAsync(Guid priceListId) => await _service.GetItemsWithPricesForPriceListAsync(priceListId);

        public async Task<ItemPriceDto> CreateAsync(CreateItemPriceDto dto) => await _service.CreateAsync(dto);

        public async Task<ItemPriceDto?> UpdateAsync(Guid id, CreateItemPriceDto dto) => await _service.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _service.DeleteAsync(id);
    }
}
