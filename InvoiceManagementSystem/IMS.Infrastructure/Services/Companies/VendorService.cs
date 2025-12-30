using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Companies;
using IMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Companies
{
    public class VendorService : IVendorService
    {
        private readonly IRepository<Vendor> _repository;
        private readonly IAddressService _addressService;

        public VendorService(IRepository<Vendor> repository, IAddressService addressService)
        {
            _repository = repository;
            _addressService = addressService;
        }

        public async Task<VendorDto> CreateAsync(CreateVendorDto dto)
        {
            var v = new Vendor
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                ContactName = dto.ContactName,
                Email = dto.Email,
                Phone = dto.Phone,
                TaxNumber = dto.TaxNumber,
                IsActive = true,
                IsDeleted = false
            };
            await _repository.AddAsync(v);
            await _repository.SaveChangesAsync();
            if (dto.AddressId.HasValue)
            {
                await _addressService.LinkToOwnerAsync(dto.AddressId.Value, OwnerType.Vendor, v.Id, true);
            }
            return await MapAsync(v);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var e = await _repository.GetByIdAsync(id);
            if (e == null) return false;

            var linked = await _addressService.GetForOwnerAsync(OwnerType.Vendor, id);
            foreach (var addr in linked)
            {
                await _addressService.UnlinkFromOwnerAsync(addr.Id, OwnerType.Vendor, id);
            }

            _repository.Delete(e);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<VendorDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            var result = new List<VendorDto>();
            // Map sequentially to avoid concurrent DbContext operations (EF Core DbContext is not thread-safe)
            foreach (var v in list)
            {
                result.Add(await MapAsync(v));
            }

            return result;
        }

        public async Task<VendorDto?> GetByIdAsync(Guid id)
        {
            var v = await _repository.GetByIdAsync(id);
            if (v == null) return null;
            return await MapAsync(v);
        }

        public async Task<VendorDto?> UpdateAsync(Guid id, CreateVendorDto dto)
        {
            var v = await _repository.GetByIdAsync(id);
            if (v == null) return null;
            if (v.IsDeleted || !v.IsActive) return null;
            v.Name = dto.Name; v.ContactName = dto.ContactName; v.Email = dto.Email; v.Phone = dto.Phone; v.TaxNumber = dto.TaxNumber;
            _repository.Update(v);
            await _repository.SaveChangesAsync();

            var previousLinked = (await _addressService.GetForOwnerAsync(OwnerType.Vendor, v.Id)).FirstOrDefault();
            var previousAddressId = previousLinked?.Id;

            if (previousAddressId != dto.AddressId)
            {
                if (previousAddressId.HasValue)
                {
                    await _addressService.UnlinkFromOwnerAsync(previousAddressId.Value, OwnerType.Vendor, v.Id);
                }
                if (dto.AddressId.HasValue)
                {
                    await _addressService.LinkToOwnerAsync(dto.AddressId.Value, OwnerType.Vendor, v.Id, true);
                }
            }

            return await MapAsync(v);
        }

        private async Task<VendorDto> MapAsync(Vendor v)
        {
            var addr = (await _addressService.GetForOwnerAsync(OwnerType.Vendor, v.Id)).FirstOrDefault();
            return new VendorDto
            {
                Id = v.Id,
                Name = v.Name,
                ContactName = v.ContactName,
                Email = v.Email,
                Phone = v.Phone,
                TaxNumber = v.TaxNumber,
                AddressId = addr?.Id,
                Address = addr
            };
        }
    }
}
