using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Warehouses
{
    public class GrnManager : IGrnManager
    {
        private readonly IGrnService _service;

        public GrnManager(IGrnService service)
        {
            _service = service;
        }

        public Task<GrnDto> CreateAsync(CreateGrnDto dto) => _service.CreateAsync(dto);
        public Task<GrnDto?> UpdateAsync(Guid id, CreateGrnDto dto) => _service.UpdateAsync(id, dto);
        public Task<IEnumerable<GrnDto>> GetAllAsync() => _service.GetAllAsync();
        public Task<GrnDto?> GetByIdAsync(Guid id) => _service.GetByIdAsync(id);
        public Task<bool> ReceiveAsync(Guid id) => _service.ReceiveAsync(id);
    }
}
