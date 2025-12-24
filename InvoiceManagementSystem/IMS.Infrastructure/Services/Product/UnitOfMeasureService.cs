using IMS.Application.DTOs.Product;
using IMS.Application.Interfaces.Product;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Product
{
    public class UnitOfMeasureService : IUnitOfMeasureService
    {
        private readonly IRepository<UnitOfMeasure> _repository;

        public UnitOfMeasureService(IRepository<UnitOfMeasure> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<UnitOfMeasureDto>> GetAllAsync()
        {
            var items = await _repository.GetAllAsync();
            return items.Select(i => new UnitOfMeasureDto
            {
                Id = i.Id,
                Name = i.Name,
                Symbol = i.Symbol
            }).ToList();
        }

        public async Task<UnitOfMeasureDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            return new UnitOfMeasureDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Symbol = entity.Symbol
            };
        }

        public async Task<UnitOfMeasureDto> CreateAsync(CreateUnitOfMeasureDto dto)
        {
            var entity = new UnitOfMeasure
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Symbol = dto.Symbol,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return new UnitOfMeasureDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Symbol = entity.Symbol
            };
        }

        public async Task<UnitOfMeasureDto?> UpdateAsync(Guid id, CreateUnitOfMeasureDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            if (entity.IsDeleted || !entity.IsActive) return null;

            entity.Name = dto.Name;
            entity.Symbol = dto.Symbol;
            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            return new UnitOfMeasureDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Symbol = entity.Symbol
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
