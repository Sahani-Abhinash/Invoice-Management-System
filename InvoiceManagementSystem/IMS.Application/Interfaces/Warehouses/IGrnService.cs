using IMS.Application.DTOs.Warehouses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Warehouses
{
    public interface IGrnService
    {
        Task<IEnumerable<GrnDto>> GetAllAsync();
        Task<GrnDto?> GetByIdAsync(Guid id);
        Task<GrnDto> CreateAsync(CreateGrnDto dto);
        Task<bool> ReceiveAsync(Guid id);
    }
}
