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
        Task<GrnDto?> UpdateAsync(Guid id, CreateGrnDto dto);
        Task<bool> ReceiveAsync(Guid id);
        Task<GrnPaymentDto> RecordPaymentAsync(Guid grnId, RecordGrnPaymentDto dto);
        Task<GrnPaymentDetailsDto?> GetPaymentDetailsAsync(Guid grnId);
    }
}
