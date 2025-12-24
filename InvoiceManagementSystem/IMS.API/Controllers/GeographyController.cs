using IMS.Application.DTOs.Geography;
using IMS.Application.Managers.Geography;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeographyController : ControllerBase
    {
        private readonly IGeographyManager _manager;

        public GeographyController(IGeographyManager manager)
        {
            _manager = manager;
        }

        // Countries
        [HttpGet("countries")]
        public async Task<IActionResult> GetCountries()
        {
            var list = await _manager.GetAllCountriesAsync();
            return Ok(list);
        }

        [HttpGet("countries/{id}")]
        public async Task<IActionResult> GetCountry(Guid id)
        {
            var item = await _manager.GetCountryByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("countries")]
        public async Task<IActionResult> CreateCountry([FromBody] CountryDto dto)
        {
            var created = await _manager.CreateCountryAsync(dto);
            return CreatedAtAction(nameof(GetCountry), new { id = created.Id }, created);
        }

        [HttpPut("countries/{id}")]
        public async Task<IActionResult> UpdateCountry(Guid id, [FromBody] CountryDto dto)
        {
            var updated = await _manager.UpdateCountryAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("countries/{id}")]
        public async Task<IActionResult> DeleteCountry(Guid id)
        {
            var ok = await _manager.DeleteCountryAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }

        // States
        [HttpGet("states")]
        public async Task<IActionResult> GetStates()
        {
            return Ok(await _manager.GetAllStatesAsync());
        }

        [HttpGet("states/{id}")]
        public async Task<IActionResult> GetState(Guid id)
        {
            var item = await _manager.GetStateByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("states")]
        public async Task<IActionResult> CreateState([FromBody] StateDto dto)
        {
            var created = await _manager.CreateStateAsync(dto);
            return CreatedAtAction(nameof(GetState), new { id = created.Id }, created);
        }

        [HttpPut("states/{id}")]
        public async Task<IActionResult> UpdateState(Guid id, [FromBody] StateDto dto)
        {
            var updated = await _manager.UpdateStateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("states/{id}")]
        public async Task<IActionResult> DeleteState(Guid id)
        {
            var ok = await _manager.DeleteStateAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }

        // Cities
        [HttpGet("cities")]
        public async Task<IActionResult> GetCities()
        {
            return Ok(await _manager.GetAllCitiesAsync());
        }

        [HttpGet("cities/{id}")]
        public async Task<IActionResult> GetCity(Guid id)
        {
            var item = await _manager.GetCityByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("cities")]
        public async Task<IActionResult> CreateCity([FromBody] CityDto dto)
        {
            var created = await _manager.CreateCityAsync(dto);
            return CreatedAtAction(nameof(GetCity), new { id = created.Id }, created);
        }

        [HttpPut("cities/{id}")]
        public async Task<IActionResult> UpdateCity(Guid id, [FromBody] CityDto dto)
        {
            var updated = await _manager.UpdateCityAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("cities/{id}")]
        public async Task<IActionResult> DeleteCity(Guid id)
        {
            var ok = await _manager.DeleteCityAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }

        // Postal codes
        [HttpGet("postalcodes")]
        public async Task<IActionResult> GetPostalCodes()
        {
            return Ok(await _manager.GetAllPostalCodesAsync());
        }

        [HttpGet("postalcodes/{id}")]
        public async Task<IActionResult> GetPostalCode(Guid id)
        {
            var item = await _manager.GetPostalCodeByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("postalcodes")]
        public async Task<IActionResult> CreatePostalCode([FromBody] PostalCodeDto dto)
        {
            var created = await _manager.CreatePostalCodeAsync(dto);
            return CreatedAtAction(nameof(GetPostalCode), new { id = created.Id }, created);
        }

        [HttpPut("postalcodes/{id}")]
        public async Task<IActionResult> UpdatePostalCode(Guid id, [FromBody] PostalCodeDto dto)
        {
            var updated = await _manager.UpdatePostalCodeAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("postalcodes/{id}")]
        public async Task<IActionResult> DeletePostalCode(Guid id)
        {
            var ok = await _manager.DeletePostalCodeAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
