using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public class PropertyAttributeManager : IPropertyAttributeManager
    {
        private readonly IPropertyAttributeService _service;

        public PropertyAttributeManager(IPropertyAttributeService service)
        {
            _service = service;
        }

        public async Task<IEnumerable<PropertyAttributeDto>> GetAllAsync() => await _service.GetAllAsync();

        public async Task<IEnumerable<PropertyAttributeDto>> GetByPropertyIdAsync(Guid propertyId) => await _service.GetByPropertyIdAsync(propertyId);

        public async Task<PropertyAttributeDto?> GetByIdAsync(Guid id) => await _service.GetByIdAsync(id);

        public async Task<PropertyAttributeDto> CreateAsync(CreatePropertyAttributeDto dto) => await _service.CreateAsync(dto);

        public async Task<PropertyAttributeDto?> UpdateAsync(Guid id, CreatePropertyAttributeDto dto) => await _service.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _service.DeleteAsync(id);
    }
}
