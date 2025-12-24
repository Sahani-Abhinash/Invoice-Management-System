using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public class UnitOfMeasureManager : IUnitOfMeasureManager
    {
        private readonly IUnitOfMeasureService _service;

        public UnitOfMeasureManager(IUnitOfMeasureService service)
        {
            _service = service;
        }

        public async Task<IEnumerable<UnitOfMeasureDto>> GetAllAsync() => await _service.GetAllAsync();

        public async Task<UnitOfMeasureDto?> GetByIdAsync(Guid id) => await _service.GetByIdAsync(id);

        public async Task<UnitOfMeasureDto> CreateAsync(CreateUnitOfMeasureDto dto) => await _service.CreateAsync(dto);

        public async Task<UnitOfMeasureDto?> UpdateAsync(Guid id, CreateUnitOfMeasureDto dto) => await _service.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _service.DeleteAsync(id);
    }
}
