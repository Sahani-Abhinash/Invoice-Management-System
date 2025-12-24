using IMS.Application.DTOs.Pricing;
using IMS.Application.Interfaces.Pricing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Pricing
{
    public class PriceListManager : IPriceListManager
    {
        private readonly IPriceListService _service;

        public PriceListManager(IPriceListService service)
        {
            _service = service;
        }

        public async Task<IEnumerable<PriceListDto>> GetAllAsync() => await _service.GetAllAsync();

        public async Task<PriceListDto?> GetByIdAsync(Guid id) => await _service.GetByIdAsync(id);

        public async Task<PriceListDto> CreateAsync(CreatePriceListDto dto) => await _service.CreateAsync(dto);

        public async Task<PriceListDto?> UpdateAsync(Guid id, CreatePriceListDto dto) => await _service.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _service.DeleteAsync(id);
    }
}
