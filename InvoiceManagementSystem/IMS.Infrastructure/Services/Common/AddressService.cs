using IMS.Application.DTOs.Common;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Common;
using IMS.Application.Interfaces.Common;
using Microsoft.EntityFrameworkCore;
using IMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Common
{
    public class AddressService : IAddressService
    {
        private readonly IRepository<IMS.Domain.Entities.Common.Address> _addrRepo;
        private readonly IRepository<IMS.Domain.Entities.Common.EntityAddress> _eaRepo;

        public AddressService(IRepository<IMS.Domain.Entities.Common.Address> addrRepo, IRepository<IMS.Domain.Entities.Common.EntityAddress> eaRepo)
        {
            _addrRepo = addrRepo;
            _eaRepo = eaRepo;
        }

        public async Task<IEnumerable<AddressDto>> GetAllAsync()
        {
            var list = await _addrRepo.GetAllAsync();
            return list.Select(a => new AddressDto { Id = a.Id, Line1 = a.Line1, Line2 = a.Line2, City = a.City, State = a.State, PostalCode = a.PostalCode, Country = a.Country, Latitude = a.Latitude, Longitude = a.Longitude, Type = a.Type });
        }

        public async Task<AddressDto?> GetByIdAsync(Guid id)
        {
            var a = await _addrRepo.GetByIdAsync(id);
            if (a == null) return null;
            return new AddressDto { Id = a.Id, Line1 = a.Line1, Line2 = a.Line2, City = a.City, State = a.State, PostalCode = a.PostalCode, Country = a.Country, Latitude = a.Latitude, Longitude = a.Longitude, Type = a.Type };
        }

        public async Task<AddressDto> CreateAsync(CreateAddressDto dto)
        {
            var a = new Address
            {
                Id = Guid.NewGuid(),
                Line1 = dto.Line1,
                Line2 = dto.Line2,
                City = dto.City,
                State = dto.State,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Type = dto.Type ?? AddressType.Other
            };
            await _addrRepo.AddAsync(a);
            await _addrRepo.SaveChangesAsync();
            return new AddressDto { Id = a.Id, Line1 = a.Line1, Line2 = a.Line2, City = a.City, State = a.State, PostalCode = a.PostalCode, Country = a.Country, Latitude = a.Latitude, Longitude = a.Longitude, Type = a.Type };
        }

        public async Task<AddressDto?> UpdateAsync(Guid id, CreateAddressDto dto)
        {
            var a = await _addrRepo.GetByIdAsync(id);
            if (a == null) return null;
            a.Line1 = dto.Line1;
            a.Line2 = dto.Line2;
            a.City = dto.City;
            a.State = dto.State;
            a.PostalCode = dto.PostalCode;
            a.Country = dto.Country;
            a.Latitude = dto.Latitude;
            a.Longitude = dto.Longitude;
            a.Type = dto.Type ?? AddressType.Other;
            _addrRepo.Update(a);
            await _addrRepo.SaveChangesAsync();
            return new AddressDto { Id = a.Id, Line1 = a.Line1, Line2 = a.Line2, City = a.City, State = a.State, PostalCode = a.PostalCode, Country = a.Country, Latitude = a.Latitude, Longitude = a.Longitude, Type = a.Type };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var a = await _addrRepo.GetByIdAsync(id);
            if (a == null) return false;
            _addrRepo.Delete(a);
            await _addrRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> LinkToOwnerAsync(Guid addressId, IMS.Domain.Enums.OwnerType ownerType, Guid ownerId, bool isPrimary = false)
        {
            var addr = await _addrRepo.GetByIdAsync(addressId);
            if (addr == null) return false;
            var existing = await _eaRepo.GetQueryable().FirstOrDefaultAsync(ea => ea.AddressId == addressId && ea.OwnerType == ownerType && ea.OwnerId == ownerId);
            if (existing != null) return true;
            var ea = new EntityAddress { Id = Guid.NewGuid(), AddressId = addressId, OwnerType = ownerType, OwnerId = ownerId, IsPrimary = isPrimary };
            await _eaRepo.AddAsync(ea);
            await _eaRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlinkFromOwnerAsync(Guid addressId, IMS.Domain.Enums.OwnerType ownerType, Guid ownerId)
        {
            var ea = await _eaRepo.GetQueryable().FirstOrDefaultAsync(e => e.AddressId == addressId && e.OwnerType == ownerType && e.OwnerId == ownerId);
            if (ea == null) return false;
            _eaRepo.Delete(ea);
            await _eaRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AddressDto>> GetForOwnerAsync(IMS.Domain.Enums.OwnerType ownerType, Guid ownerId)
        {
            var list = await _eaRepo.GetQueryable()
                .Where(ea => ea.OwnerType == ownerType && ea.OwnerId == ownerId)
                .Include(ea => ea.Address)
                .Select(ea => new AddressDto {
                    Id = ea.Address.Id,
                    Line1 = ea.Address.Line1,
                    Line2 = ea.Address.Line2,
                    City = ea.Address.City,
                    State = ea.Address.State,
                    PostalCode = ea.Address.PostalCode,
                    Country = ea.Address.Country,
                    Latitude = ea.Address.Latitude,
                    Longitude = ea.Address.Longitude,
                    Type = ea.Address.Type
                })
                .ToListAsync();
            return list;
        }
    }
}
