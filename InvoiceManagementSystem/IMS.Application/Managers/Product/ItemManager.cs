using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public class ItemManager : IItemManager
    {
        private readonly IItemService _service;

        public ItemManager(IItemService service)
        {
            _service = service;
        }

        public async Task<IEnumerable<ItemDto>> GetAllAsync() => await _service.GetAllAsync();

        public async Task<ItemDetailsDto?> GetByIdAsync(Guid id) => await _service.GetByIdAsync(id);

        public async Task<ItemDto> CreateAsync(CreateItemDto dto) => await _service.CreateAsync(dto);

        public async Task<ItemDto?> UpdateAsync(Guid id, CreateItemDto dto) => await _service.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _service.DeleteAsync(id);
    }
}
