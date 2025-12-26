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
            var list = await _addrRepo.GetAllAsync(
                a => a.CountryRef,
                a => a.StateRef,
                a => a.CityRef,
                a => a.PostalCodeRef
            );
            
            Console.WriteLine($"📊 GetAllAsync: Loaded {list.Count()} addresses");
            foreach (var a in list)
            {
                Console.WriteLine($"  Address: {a.Line1}, CountryRef: {a.CountryRef?.Name ?? "NULL"}, StateRef: {a.StateRef?.Name ?? "NULL"}, CityRef: {a.CityRef?.Name ?? "NULL"}");
            }
            
            return list.Select(a => new AddressDto {
                Id = a.Id,
                Line1 = a.Line1,
                Line2 = a.Line2,
                CountryId = a.CountryId,
                StateId = a.StateId,
                CityId = a.CityId,
                PostalCodeId = a.PostalCodeId,
                Country = a.CountryRef != null ? new IMS.Application.DTOs.Geography.CountryDto { Id = a.CountryRef.Id, Name = a.CountryRef.Name } : null,
                State = a.StateRef != null ? new IMS.Application.DTOs.Geography.StateDto { Id = a.StateRef.Id, Name = a.StateRef.Name } : null,
                City = a.CityRef != null ? new IMS.Application.DTOs.Geography.CityDto { Id = a.CityRef.Id, Name = a.CityRef.Name } : null,
                PostalCode = a.PostalCodeRef != null ? new IMS.Application.DTOs.Geography.PostalCodeDto { Id = a.PostalCodeRef.Id, Code = a.PostalCodeRef.Code } : null,
                Latitude = a.Latitude,
                Longitude = a.Longitude,
                Type = a.Type
            });
        }

        public async Task<AddressDto?> GetByIdAsync(Guid id)
        {
            var a = await _addrRepo.GetByIdAsync(id,
                a => a.CountryRef,
                a => a.StateRef,
                a => a.CityRef,
                a => a.PostalCodeRef
            );
            if (a == null) return null;
            return new AddressDto {
                Id = a.Id,
                Line1 = a.Line1,
                Line2 = a.Line2,
                CountryId = a.CountryId,
                StateId = a.StateId,
                CityId = a.CityId,
                PostalCodeId = a.PostalCodeId,
                Country = a.CountryRef != null ? new IMS.Application.DTOs.Geography.CountryDto { Id = a.CountryRef.Id, Name = a.CountryRef.Name } : null,
                State = a.StateRef != null ? new IMS.Application.DTOs.Geography.StateDto { Id = a.StateRef.Id, Name = a.StateRef.Name } : null,
                City = a.CityRef != null ? new IMS.Application.DTOs.Geography.CityDto { Id = a.CityRef.Id, Name = a.CityRef.Name } : null,
                PostalCode = a.PostalCodeRef != null ? new IMS.Application.DTOs.Geography.PostalCodeDto { Id = a.PostalCodeRef.Id, Code = a.PostalCodeRef.Code } : null,
                Latitude = a.Latitude,
                Longitude = a.Longitude,
                Type = a.Type
            };
        }

        public async Task<AddressDto> CreateAsync(CreateAddressDto dto)
        {
            var a = new Address
            {
                Id = Guid.NewGuid(),
                Line1 = dto.Line1,
                Line2 = dto.Line2,
                CountryId = dto.CountryId,
                StateId = dto.StateId,
                CityId = dto.CityId,
                PostalCodeId = dto.PostalCodeId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Type = dto.Type ?? AddressType.Other
            };
            await _addrRepo.AddAsync(a);
            await _addrRepo.SaveChangesAsync();
            return new AddressDto { Id = a.Id, Line1 = a.Line1, Line2 = a.Line2, CountryId = a.CountryId, StateId = a.StateId, CityId = a.CityId, PostalCodeId = a.PostalCodeId, Latitude = a.Latitude, Longitude = a.Longitude, Type = a.Type };
        }

        public async Task<AddressDto?> UpdateAsync(Guid id, CreateAddressDto dto)
        {
            var a = await _addrRepo.GetByIdAsync(id);
            if (a == null) return null;
            a.Line1 = dto.Line1;
            a.Line2 = dto.Line2;
            a.CountryId = dto.CountryId;
            a.StateId = dto.StateId;
            a.CityId = dto.CityId;
            a.PostalCodeId = dto.PostalCodeId;
            a.Latitude = dto.Latitude;
            a.Longitude = dto.Longitude;
            a.Type = dto.Type ?? AddressType.Other;
            _addrRepo.Update(a);
            await _addrRepo.SaveChangesAsync();
            return new AddressDto { Id = a.Id, Line1 = a.Line1, Line2 = a.Line2, CountryId = a.CountryId, StateId = a.StateId, CityId = a.CityId, PostalCodeId = a.PostalCodeId, Latitude = a.Latitude, Longitude = a.Longitude, Type = a.Type };
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
                    .ThenInclude(a => a.CountryRef)
                .Include(ea => ea.Address)
                    .ThenInclude(a => a.StateRef)
                .Include(ea => ea.Address)
                    .ThenInclude(a => a.CityRef)
                .Include(ea => ea.Address)
                    .ThenInclude(a => a.PostalCodeRef)
                .Select(ea => new AddressDto {
                    Id = ea.Address.Id,
                    Line1 = ea.Address.Line1,
                    Line2 = ea.Address.Line2,
                    CountryId = ea.Address.CountryId,
                    StateId = ea.Address.StateId,
                    CityId = ea.Address.CityId,
                    PostalCodeId = ea.Address.PostalCodeId,
                    Country = ea.Address.CountryRef != null ? new IMS.Application.DTOs.Geography.CountryDto { Id = ea.Address.CountryRef.Id, Name = ea.Address.CountryRef.Name } : null,
                    State = ea.Address.StateRef != null ? new IMS.Application.DTOs.Geography.StateDto { Id = ea.Address.StateRef.Id, Name = ea.Address.StateRef.Name } : null,
                    City = ea.Address.CityRef != null ? new IMS.Application.DTOs.Geography.CityDto { Id = ea.Address.CityRef.Id, Name = ea.Address.CityRef.Name } : null,
                    PostalCode = ea.Address.PostalCodeRef != null ? new IMS.Application.DTOs.Geography.PostalCodeDto { Id = ea.Address.PostalCodeRef.Id, Code = ea.Address.PostalCodeRef.Code } : null,
                    Latitude = ea.Address.Latitude,
                    Longitude = ea.Address.Longitude,
                    Type = ea.Address.Type
                })
                .ToListAsync();
            return list;
        }
    }
}
