using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public class ItemImageManager : IItemImageManager
    {
        private readonly IItemImageService _service;

        public ItemImageManager(IItemImageService service)
        {
            _service = service;
        }

        public async Task<IEnumerable<ItemImageDto>> GetAllAsync() => await _service.GetAllAsync();

        public async Task<ItemImageDto?> GetByIdAsync(Guid id) => await _service.GetByIdAsync(id);

        public async Task<IEnumerable<ItemImageDto>> GetByItemIdAsync(Guid itemId) => await _service.GetByItemIdAsync(itemId);

        public async Task<ItemImageDto> CreateAsync(CreateItemImageDto dto) => await _service.CreateAsync(dto);

        public async Task<ItemImageDto?> UpdateAsync(Guid id, CreateItemImageDto dto) => await _service.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _service.DeleteAsync(id);
    }
}
