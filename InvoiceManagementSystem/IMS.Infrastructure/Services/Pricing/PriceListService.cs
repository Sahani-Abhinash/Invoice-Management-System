using IMS.Application.DTOs.Pricing;
using IMS.Application.Interfaces.Pricing;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Pricing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Pricing
{
    public class PriceListService : IPriceListService
    {
        private readonly IRepository<PriceList> _repository;

        public PriceListService(IRepository<PriceList> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<PriceListDto>> GetAllAsync()
        {
            var lists = await _repository.GetAllAsync();
            return lists.Select(l => new PriceListDto
            {
                Id = l.Id,
                Name = l.Name,
                IsDefault = l.IsDefault
            }).ToList();
        }

        public async Task<PriceListDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            return new PriceListDto
            {
                Id = entity.Id,
                Name = entity.Name,
                IsDefault = entity.IsDefault
            };
        }

        public async Task<PriceListDto> CreateAsync(CreatePriceListDto dto)
        {
            var entity = new PriceList
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                IsDefault = dto.IsDefault,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new PriceListDto
            {
                Id = entity.Id,
                Name = entity.Name,
                IsDefault = entity.IsDefault
            };
        }

        public async Task<PriceListDto?> UpdateAsync(Guid id, CreatePriceListDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            if (entity.IsDeleted || !entity.IsActive) return null;

            entity.Name = dto.Name;
            entity.IsDefault = dto.IsDefault;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            return new PriceListDto
            {
                Id = entity.Id,
                Name = entity.Name,
                IsDefault = entity.IsDefault
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;
            if (entity.IsDeleted) return false;

            _repository.Delete(entity);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
