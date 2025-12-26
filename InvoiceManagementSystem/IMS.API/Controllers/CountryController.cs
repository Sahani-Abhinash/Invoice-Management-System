using IMS.Application.DTOs.Geography;
using IMS.Application.Managers.Geography;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CountryController : ControllerBase
    {
        private readonly IGeographyManager _manager;

        public CountryController(IGeographyManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var list = await _manager.GetAllCountriesAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching countries", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _manager.GetCountryByIdAsync(id);
                if (item == null) return NotFound(new { message = "Country not found" });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching country", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CountryDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid data", errors = ModelState });

                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest(new { message = "Country name is required" });

                var created = await _manager.CreateCountryAsync(dto);
                if (created == null)
                    return BadRequest(new { message = "Failed to create country" });

                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error creating country", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CountryDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid data", errors = ModelState });

                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest(new { message = "Country name is required" });

                var updated = await _manager.UpdateCountryAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Country not found" });

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error updating country", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _manager.DeleteCountryAsync(id);
                if (!ok) return NotFound(new { message = "Country not found" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error deleting country", error = ex.Message });
            }
        }
    }
}
