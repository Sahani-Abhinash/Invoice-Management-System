using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Common;
using IMS.Domain.Entities.Companies;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Companies
{
    public class BranchService : IBranchService
    {
        private readonly IRepository<Branch> _repository;
        private readonly IMS.Application.Interfaces.Common.IAddressService _addressService;

        public BranchService(IRepository<Branch> repository, IMS.Application.Interfaces.Common.IAddressService addressService)
        {
            _repository = repository;
            _addressService = addressService;
        }

        public async Task<IEnumerable<BranchDto>> GetAllAsync()
        {
            var branches = await _repository.GetAllAsync();
            var list = new List<BranchDto>();
            // Map sequentially to avoid concurrent DbContext operations (EF Core DbContext is not thread-safe)
            foreach (var b in branches)
            {
                list.Add(await MapToDtoAsync(b));
            }

            return list;
        }

        public async Task<BranchDto?> GetByIdAsync(Guid id)
        {
            var branchEntity = await _repository.GetByIdAsync(id);
            if (branchEntity == null) return null;
            return await MapToDtoAsync(branchEntity);
        }

        // Company-scoped retrieval removed; branches are independent.

        public async Task<BranchDto> CreateAsync(CreateBranchDto dto)
        {
            var branchEntity = new Branch
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(branchEntity);
            await _repository.SaveChangesAsync();

            // If an AddressId was provided, link it to this Branch via EntityAddress
            if (dto.AddressId.HasValue)
            {
                await _addressService.LinkToOwnerAsync(dto.AddressId.Value, IMS.Domain.Enums.OwnerType.Branch, branchEntity.Id, true);
            }

            return await MapToDtoAsync(branchEntity);
        }

        public async Task<BranchDto?> UpdateAsync(Guid id, CreateBranchDto dto)
        {
            var branchEntity = await _repository.GetByIdAsync(id);
            if (branchEntity == null) return null;

            // FindAsync may return soft-deleted entities; ensure entity is active and not deleted
            if (branchEntity.IsDeleted || !branchEntity.IsActive) return null;
            // Determine previously linked address (if any)
            var previousLinked = (await _addressService.GetForOwnerAsync(IMS.Domain.Enums.OwnerType.Branch, branchEntity.Id)).FirstOrDefault();
            Guid? previousAddressId = previousLinked?.Id;

            branchEntity.Name = dto.Name;

            _repository.Update(branchEntity);
            await _repository.SaveChangesAsync();

            // Manage EntityAddress links: unlink previous if changed, link new if provided
            if (previousAddressId != dto.AddressId)
            {
                if (previousAddressId.HasValue)
                {
                    await _addressService.UnlinkFromOwnerAsync(previousAddressId.Value, IMS.Domain.Enums.OwnerType.Branch, branchEntity.Id);
                }
                if (dto.AddressId.HasValue)
                {
                    await _addressService.LinkToOwnerAsync(dto.AddressId.Value, IMS.Domain.Enums.OwnerType.Branch, branchEntity.Id, true);
                }
            }

            return await MapToDtoAsync(branchEntity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var branchEntity = await _repository.GetByIdAsync(id);
            if (branchEntity == null) return false;

            if (branchEntity.IsDeleted) return false; // already deleted

            // Clean up any address links for this branch
            var linkedAddresses = await _addressService.GetForOwnerAsync(IMS.Domain.Enums.OwnerType.Branch, id);
            foreach (var addr in linkedAddresses)
            {
                await _addressService.UnlinkFromOwnerAsync(addr.Id, IMS.Domain.Enums.OwnerType.Branch, id);
            }

            // mark as deleted via repository deletion (DbContext SaveChanges will convert to soft-delete)
            _repository.Delete(branchEntity);
            await _repository.SaveChangesAsync();
            return true;
        }

        private async Task<BranchDto> MapToDtoAsync(Branch branch)
        {
            // Fetch linked addresses for this branch (via EntityAddress)
            var linked = await _addressService.GetForOwnerAsync(IMS.Domain.Enums.OwnerType.Branch, branch.Id);
            var primary = linked.FirstOrDefault();

            return new BranchDto
            {
                Id = branch.Id,
                Name = branch.Name,
                AddressId = primary?.Id,
                Address = primary,
                // Company relation removed
            };
        }
    }
}
