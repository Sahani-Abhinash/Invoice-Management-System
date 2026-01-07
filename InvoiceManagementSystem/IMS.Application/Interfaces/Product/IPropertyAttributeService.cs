using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Product
{
    public interface IPropertyAttributeService
    {
        Task<IEnumerable<PropertyAttributeDto>> GetAllAsync();
        Task<IEnumerable<PropertyAttributeDto>> GetByPropertyIdAsync(Guid propertyId);
        Task<PropertyAttributeDto?> GetByIdAsync(Guid id);
        Task<PropertyAttributeDto> CreateAsync(CreatePropertyAttributeDto dto);
        Task<PropertyAttributeDto?> UpdateAsync(Guid id, CreatePropertyAttributeDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
