using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Product
{
    public interface IProductPropertyService
    {
        Task<IEnumerable<ProductPropertyDto>> GetAllAsync();
        Task<ProductPropertyDto?> GetByIdAsync(Guid id);
        Task<ProductPropertyDto> CreateAsync(CreateProductPropertyDto dto);
        Task<ProductPropertyDto?> UpdateAsync(Guid id, CreateProductPropertyDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
