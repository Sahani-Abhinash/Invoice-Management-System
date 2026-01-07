using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public class ItemPropertyAttributeManager : IItemPropertyAttributeManager
    {
        private readonly IItemPropertyAttributeService _service;

        public ItemPropertyAttributeManager(IItemPropertyAttributeService service)
        {
            _service = service;
        }

        public async Task<ItemPropertyAttributeDto> GetByIdAsync(Guid id)
        {
            return await _service.GetByIdAsync(id);
        }

        public async Task<List<ItemPropertyAttributeDto>> GetAllAsync()
        {
            return await _service.GetAllAsync();
        }

        public async Task<List<ItemPropertyAttributeDto>> GetByItemIdAsync(Guid itemId)
        {
            return await _service.GetByItemIdAsync(itemId);
        }

        public async Task<List<ItemPropertyAttributeDto>> GetByPropertyAttributeIdAsync(Guid propertyAttributeId)
        {
            return await _service.GetByPropertyAttributeIdAsync(propertyAttributeId);
        }

        public async Task<ItemPropertyAttributeDto> CreateAsync(CreateItemPropertyAttributeDto dto)
        {
            return await _service.CreateAsync(dto);
        }

        public async Task<ItemPropertyAttributeDto> UpdateAsync(UpdateItemPropertyAttributeDto dto)
        {
            return await _service.UpdateAsync(dto);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _service.DeleteAsync(id);
        }

        public async Task<bool> DeleteByItemIdAsync(Guid itemId)
        {
            return await _service.DeleteByItemIdAsync(itemId);
        }
    }
}
