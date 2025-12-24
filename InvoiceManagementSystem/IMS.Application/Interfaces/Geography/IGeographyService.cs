using IMS.Application.DTOs.Geography;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Geography
{
    public interface IGeographyService
    {
        // Countries
        Task<IEnumerable<CountryDto>> GetAllCountriesAsync();
        Task<CountryDto?> GetCountryByIdAsync(Guid id);
        Task<CountryDto> CreateCountryAsync(CountryDto dto);
        Task<CountryDto?> UpdateCountryAsync(Guid id, CountryDto dto);
        Task<bool> DeleteCountryAsync(Guid id);

        // States
        Task<IEnumerable<StateDto>> GetAllStatesAsync();
        Task<StateDto?> GetStateByIdAsync(Guid id);
        Task<StateDto> CreateStateAsync(StateDto dto);
        Task<StateDto?> UpdateStateAsync(Guid id, StateDto dto);
        Task<bool> DeleteStateAsync(Guid id);

        // Cities
        Task<IEnumerable<CityDto>> GetAllCitiesAsync();
        Task<CityDto?> GetCityByIdAsync(Guid id);
        Task<CityDto> CreateCityAsync(CityDto dto);
        Task<CityDto?> UpdateCityAsync(Guid id, CityDto dto);
        Task<bool> DeleteCityAsync(Guid id);

        // PostalCodes
        Task<IEnumerable<PostalCodeDto>> GetAllPostalCodesAsync();
        Task<PostalCodeDto?> GetPostalCodeByIdAsync(Guid id);
        Task<PostalCodeDto> CreatePostalCodeAsync(PostalCodeDto dto);
        Task<PostalCodeDto?> UpdatePostalCodeAsync(Guid id, PostalCodeDto dto);
        Task<bool> DeletePostalCodeAsync(Guid id);
    }
}