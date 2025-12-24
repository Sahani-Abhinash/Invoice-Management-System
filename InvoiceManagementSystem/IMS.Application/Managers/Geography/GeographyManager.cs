using IMS.Application.DTOs.Geography;
using IMS.Application.Interfaces.Geography;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Geography
{
    public class GeographyManager : IGeographyManager
    {
        private readonly IGeographyService _service;

        public GeographyManager(IGeographyService service)
        {
            _service = service;
        }

        // Countries
        public Task<CountryDto> CreateCountryAsync(CountryDto dto) => _service.CreateCountryAsync(dto);
        public Task<bool> DeleteCountryAsync(Guid id) => _service.DeleteCountryAsync(id);
        public Task<IEnumerable<CountryDto>> GetAllCountriesAsync() => _service.GetAllCountriesAsync();
        public Task<CountryDto?> GetCountryByIdAsync(Guid id) => _service.GetCountryByIdAsync(id);
        public Task<CountryDto?> UpdateCountryAsync(Guid id, CountryDto dto) => _service.UpdateCountryAsync(id, dto);

        // States
        public Task<StateDto> CreateStateAsync(StateDto dto) => _service.CreateStateAsync(dto);
        public Task<bool> DeleteStateAsync(Guid id) => _service.DeleteStateAsync(id);
        public Task<IEnumerable<StateDto>> GetAllStatesAsync() => _service.GetAllStatesAsync();
        public Task<StateDto?> GetStateByIdAsync(Guid id) => _service.GetStateByIdAsync(id);
        public Task<StateDto?> UpdateStateAsync(Guid id, StateDto dto) => _service.UpdateStateAsync(id, dto);

        // Cities
        public Task<CityDto> CreateCityAsync(CityDto dto) => _service.CreateCityAsync(dto);
        public Task<bool> DeleteCityAsync(Guid id) => _service.DeleteCityAsync(id);
        public Task<IEnumerable<CityDto>> GetAllCitiesAsync() => _service.GetAllCitiesAsync();
        public Task<CityDto?> GetCityByIdAsync(Guid id) => _service.GetCityByIdAsync(id);
        public Task<CityDto?> UpdateCityAsync(Guid id, CityDto dto) => _service.UpdateCityAsync(id, dto);

        // PostalCodes
        public Task<PostalCodeDto> CreatePostalCodeAsync(PostalCodeDto dto) => _service.CreatePostalCodeAsync(dto);
        public Task<bool> DeletePostalCodeAsync(Guid id) => _service.DeletePostalCodeAsync(id);
        public Task<IEnumerable<PostalCodeDto>> GetAllPostalCodesAsync() => _service.GetAllPostalCodesAsync();
        public Task<PostalCodeDto?> GetPostalCodeByIdAsync(Guid id) => _service.GetPostalCodeByIdAsync(id);
        public Task<PostalCodeDto?> UpdatePostalCodeAsync(Guid id, PostalCodeDto dto) => _service.UpdatePostalCodeAsync(id, dto);
    }
}
