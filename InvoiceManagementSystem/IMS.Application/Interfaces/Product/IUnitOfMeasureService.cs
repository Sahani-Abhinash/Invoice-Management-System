using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Product
{
    public interface IUnitOfMeasureService
    {
        Task<IEnumerable<UnitOfMeasureDto>> GetAllAsync();
        Task<UnitOfMeasureDto?> GetByIdAsync(Guid id);
        Task<UnitOfMeasureDto> CreateAsync(CreateUnitOfMeasureDto dto);
        Task<UnitOfMeasureDto?> UpdateAsync(Guid id, CreateUnitOfMeasureDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
