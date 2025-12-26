using IMS.Application.DTOs.Companies;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Companies
{
    public interface IVendorService
    {
        Task<IEnumerable<VendorDto>> GetAllAsync();
        Task<VendorDto?> GetByIdAsync(Guid id);
        Task<VendorDto> CreateAsync(CreateVendorDto dto);
        Task<VendorDto?> UpdateAsync(Guid id, CreateVendorDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
