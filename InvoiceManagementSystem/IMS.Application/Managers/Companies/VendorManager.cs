using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Companies
{
    public class VendorManager : IVendorManager
    {
        private readonly IVendorService _service;

        public VendorManager(IVendorService service)
        {
            _service = service;
        }

        public Task<IEnumerable<VendorDto>> GetAllAsync() => _service.GetAllAsync();
        public Task<VendorDto?> GetByIdAsync(Guid id) => _service.GetByIdAsync(id);
        public Task<VendorDto> CreateAsync(CreateVendorDto dto) => _service.CreateAsync(dto);
        public Task<VendorDto?> UpdateAsync(Guid id, CreateVendorDto dto) => _service.UpdateAsync(id, dto);
        public Task<bool> DeleteAsync(Guid id) => _service.DeleteAsync(id);
    }
}
