using IMS.Application.DTOs.Geography;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Geography;
using IMS.Domain.Entities.Geography;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Geography
{
    public class GeographyService : IGeographyService
    {
        private readonly IRepository<Country> _countryRepo;
        private readonly IRepository<State> _stateRepo;
        private readonly IRepository<City> _cityRepo;
        private readonly IRepository<PostalCode> _postalRepo;

        public GeographyService(
            IRepository<Country> countryRepo,
            IRepository<State> stateRepo,
            IRepository<City> cityRepo,
            IRepository<PostalCode> postalRepo)
        {
            _countryRepo = countryRepo;
            _stateRepo = stateRepo;
            _cityRepo = cityRepo;
            _postalRepo = postalRepo;
        }

        // Countries
        public async Task<CountryDto> CreateCountryAsync(CountryDto dto)
        {
            var entity = new Country { Id = Guid.NewGuid(), Name = dto.Name, ISOCode = dto.ISOCode };
            await _countryRepo.AddAsync(entity);
            await _countryRepo.SaveChangesAsync();
            dto.Id = entity.Id;
            return dto;
        }

        public async Task<bool> DeleteCountryAsync(Guid id)
        {
            var e = await _countryRepo.GetByIdAsync(id);
            if (e == null) return false;
            _countryRepo.Delete(e);
            await _countryRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CountryDto>> GetAllCountriesAsync()
        {
            var list = await _countryRepo.GetAllAsync();
            return list.Select(c => new CountryDto { Id = c.Id, Name = c.Name, ISOCode = c.ISOCode });
        }

        public async Task<CountryDto?> GetCountryByIdAsync(Guid id)
        {
            var c = await _countryRepo.GetByIdAsync(id);
            if (c == null) return null;
            return new CountryDto { Id = c.Id, Name = c.Name, ISOCode = c.ISOCode };
        }

        public async Task<CountryDto?> UpdateCountryAsync(Guid id, CountryDto dto)
        {
            var e = await _countryRepo.GetByIdAsync(id);
            if (e == null) return null;
            e.Name = dto.Name;
            e.ISOCode = dto.ISOCode;
            _countryRepo.Update(e);
            await _countryRepo.SaveChangesAsync();
            return dto;
        }

        // States
        public async Task<StateDto> CreateStateAsync(StateDto dto)
        {
            var e = new State { Id = Guid.NewGuid(), Name = dto.Name, CountryId = dto.Country?.Id ?? Guid.Empty };
            await _stateRepo.AddAsync(e);
            await _stateRepo.SaveChangesAsync();
            dto.Id = e.Id;
            return dto;
        }

        public async Task<bool> DeleteStateAsync(Guid id)
        {
            var e = await _stateRepo.GetByIdAsync(id);
            if (e == null) return false;
            _stateRepo.Delete(e);
            await _stateRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<StateDto>> GetAllStatesAsync()
        {
            var list = await _stateRepo.GetAllAsync(s => s.Country);
            return list.Select(s => new StateDto { Id = s.Id, Name = s.Name, Country = s.Country == null ? null : new CountryDto { Id = s.Country.Id, Name = s.Country.Name, ISOCode = s.Country.ISOCode } });
        }

        public async Task<StateDto?> GetStateByIdAsync(Guid id)
        {
            var s = await _stateRepo.GetByIdAsync(id, st => st.Country);
            if (s == null) return null;
            return new StateDto { Id = s.Id, Name = s.Name, Country = s.Country == null ? null : new CountryDto { Id = s.Country.Id, Name = s.Country.Name, ISOCode = s.Country.ISOCode } };
        }

        public async Task<StateDto?> UpdateStateAsync(Guid id, StateDto dto)
        {
            var e = await _stateRepo.GetByIdAsync(id);
            if (e == null) return null;
            e.Name = dto.Name;
            e.CountryId = dto.Country?.Id ?? e.CountryId;
            _stateRepo.Update(e);
            await _stateRepo.SaveChangesAsync();
            return dto;
        }

        // Cities
        public async Task<CityDto> CreateCityAsync(CityDto dto)
        {
            var e = new City { Id = Guid.NewGuid(), Name = dto.Name, StateId = dto.State?.Id ?? Guid.Empty };
            await _cityRepo.AddAsync(e);
            await _cityRepo.SaveChangesAsync();
            dto.Id = e.Id;
            return dto;
        }

        public async Task<bool> DeleteCityAsync(Guid id)
        {
            var e = await _cityRepo.GetByIdAsync(id);
            if (e == null) return false;
            _cityRepo.Delete(e);
            await _cityRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CityDto>> GetAllCitiesAsync()
        {
            var list = await _cityRepo.GetAllAsync(c => c.State);
            return list.Select(c => new CityDto { Id = c.Id, Name = c.Name, State = c.State == null ? null : new StateDto { Id = c.State.Id, Name = c.State.Name } });
        }

        public async Task<CityDto?> GetCityByIdAsync(Guid id)
        {
            var c = await _cityRepo.GetByIdAsync(id, ct => ct.State);
            if (c == null) return null;
            return new CityDto { Id = c.Id, Name = c.Name, State = c.State == null ? null : new StateDto { Id = c.State.Id, Name = c.State.Name } };
        }

        public async Task<CityDto?> UpdateCityAsync(Guid id, CityDto dto)
        {
            var e = await _cityRepo.GetByIdAsync(id);
            if (e == null) return null;
            e.Name = dto.Name;
            e.StateId = dto.State?.Id ?? e.StateId;
            _cityRepo.Update(e);
            await _cityRepo.SaveChangesAsync();
            return dto;
        }

        // PostalCodes
        public async Task<PostalCodeDto> CreatePostalCodeAsync(PostalCodeDto dto)
        {
            var e = new PostalCode { Id = Guid.NewGuid(), Code = dto.Code, CityId = dto.City?.Id ?? Guid.Empty };
            await _postalRepo.AddAsync(e);
            await _postalRepo.SaveChangesAsync();
            dto.Id = e.Id;
            return dto;
        }

        public async Task<bool> DeletePostalCodeAsync(Guid id)
        {
            var e = await _postalRepo.GetByIdAsync(id);
            if (e == null) return false;
            _postalRepo.Delete(e);
            await _postalRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<PostalCodeDto>> GetAllPostalCodesAsync()
        {
            var list = await _postalRepo.GetAllAsync(pc => pc.City);
            return list.Select(pc => new PostalCodeDto { Id = pc.Id, Code = pc.Code, City = pc.City == null ? null : new CityDto { Id = pc.City.Id, Name = pc.City.Name } });
        }

        public async Task<PostalCodeDto?> GetPostalCodeByIdAsync(Guid id)
        {
            var p = await _postalRepo.GetByIdAsync(id, pc => pc.City);
            if (p == null) return null;
            return new PostalCodeDto { Id = p.Id, Code = p.Code, City = p.City == null ? null : new CityDto { Id = p.City.Id, Name = p.City.Name } };
        }

        public async Task<PostalCodeDto?> UpdatePostalCodeAsync(Guid id, PostalCodeDto dto)
        {
            var e = await _postalRepo.GetByIdAsync(id);
            if (e == null) return null;
            e.Code = dto.Code;
            e.CityId = dto.City?.Id ?? e.CityId;
            _postalRepo.Update(e);
            await _postalRepo.SaveChangesAsync();
            return dto;
        }
    }
}
