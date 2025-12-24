using IMS.Application.DTOs.Pricing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Pricing
{
    public interface IPriceListManager
    {
        Task<IEnumerable<PriceListDto>> GetAllAsync();
        Task<PriceListDto?> GetByIdAsync(Guid id);
        Task<PriceListDto> CreateAsync(CreatePriceListDto dto);
        Task<PriceListDto?> UpdateAsync(Guid id, CreatePriceListDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
