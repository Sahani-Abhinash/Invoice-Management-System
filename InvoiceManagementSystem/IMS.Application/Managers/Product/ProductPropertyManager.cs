using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public class ProductPropertyManager : IProductPropertyManager
    {
        private readonly IProductPropertyService _service;

        public ProductPropertyManager(IProductPropertyService service)
        {
            _service = service;
        }

        public async Task<IEnumerable<ProductPropertyDto>> GetAllAsync() => await _service.GetAllAsync();

        public async Task<ProductPropertyDto?> GetByIdAsync(Guid id) => await _service.GetByIdAsync(id);

        public async Task<ProductPropertyDto> CreateAsync(CreateProductPropertyDto dto) => await _service.CreateAsync(dto);

        public async Task<ProductPropertyDto?> UpdateAsync(Guid id, CreateProductPropertyDto dto) => await _service.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _service.DeleteAsync(id);
    }
}
