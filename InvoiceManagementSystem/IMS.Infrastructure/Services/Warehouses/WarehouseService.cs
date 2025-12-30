using IMS.Application.DTOs.Warehouses;
using IMS.Application.Interfaces.Warehouses;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Warehouse;
using IMS.Domain.Entities.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Warehouses
{
    public class WarehouseService : IWarehouseService
    {
        private readonly IRepository<Warehouse> _repository;
        private readonly IRepository<Branch> _branchRepository;
        private readonly IMS.Application.Interfaces.Common.IAddressService _addressService;

        public WarehouseService(IRepository<Warehouse> repository, IRepository<Branch> branchRepository, IMS.Application.Interfaces.Common.IAddressService addressService)
        {
            _repository = repository;
            _branchRepository = branchRepository;
            _addressService = addressService;
        }

        public async Task<IEnumerable<WarehouseDto>> GetAllAsync()
        {
            var warehouses = await _repository.GetAllAsync(w => w.Branch);
            var result = new List<WarehouseDto>();
            // Map sequentially to avoid concurrent DbContext operations (EF Core DbContext is not thread-safe)
            foreach (var w in warehouses)
            {
                result.Add(await MapToDtoAsync(w, w.Branch!));
            }
            return result;
        }

        public async Task<WarehouseDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id, w => w.Branch);
            if (entity == null) return null;
            return await MapToDtoAsync(entity, entity.Branch!);
        }

        public async Task<IEnumerable<WarehouseDto>> GetByBranchIdAsync(Guid branchId)
        {
            var warehouses = await _repository.GetAllAsync(w => w.Branch);
            warehouses = warehouses.Where(w => w.BranchId == branchId);
            var result = new List<WarehouseDto>();
            foreach (var w in warehouses)
            {
                result.Add(await MapToDtoAsync(w, w.Branch!));
            }
            return result;
        }

        public async Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto)
        {
            var entity = new Warehouse
            {
                Id = Guid.NewGuid(),
                BranchId = dto.BranchId,
                Name = dto.Name,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            var branch = await _branchRepository.GetByIdAsync(entity.BranchId);
            return await MapToDtoAsync(entity, branch!);
        }

        public async Task<WarehouseDto?> UpdateAsync(Guid id, CreateWarehouseDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            if (entity.IsDeleted || !entity.IsActive) return null;

            entity.BranchId = dto.BranchId;
            entity.Name = dto.Name;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();
            var branch = await _branchRepository.GetByIdAsync(entity.BranchId);
            return await MapToDtoAsync(entity, branch!);
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

        private async Task<WarehouseDto> MapToDtoAsync(Warehouse w, Branch b)
        {
            var linked = await _addressService.GetForOwnerAsync(IMS.Domain.Enums.OwnerType.Branch, b.Id);
            var primary = linked.FirstOrDefault();

            return new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Branch = new IMS.Application.DTOs.Companies.BranchDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    AddressId = primary?.Id,
                    Address = primary
                }
            };
        }
    }
}
