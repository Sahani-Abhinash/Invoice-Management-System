using IMS.Application.DTOs.Companies;
using IMS.Application.Managers.Companies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers
{
    /// <summary>
    /// API controller for managing companies (CRUD endpoints).
    /// Delegates work to the CompanyManager.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyManager _companyManager;

        public CompanyController(ICompanyManager companyManager)
        {
            _companyManager = companyManager;
        }

        [HttpGet]
        /// <summary>
        /// Retrieves all companies.
        /// </summary>
        /// <returns>200 OK with a list of companies.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _companyManager.GetAllAsync();
            return Ok(companies);
        }
        
        /// <summary>
        /// Retrieves a company by id.
        /// </summary>
        /// <param name="id">Company identifier.</param>
        /// <returns>200 OK with company DTO or 404 if not found.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var company = await _companyManager.GetByIdAsync(id);
            if (company == null) return NotFound();
            return Ok(company);
        }

        [HttpPost]
        /// <summary>
        /// Creates a new company.
        /// </summary>
        /// <param name="dto">Company create DTO.</param>
        /// <returns>201 Created with the created company.</returns>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCompanyDto dto)
        {
            var company = await _companyManager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = company.Id }, company);
        }

        
        /// <summary>
        /// Updates an existing company.
        /// </summary>
        /// <param name="id">Company identifier.</param>
        /// <param name="dto">Updated company data.</param>
        /// <returns>200 OK with updated company or 404 if not found.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateCompanyDto dto)
        {
            var updated = await _companyManager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        
        /// <summary>
        /// Deletes (soft-delete) a company by id.
        /// </summary>
        /// <param name="id">Company identifier.</param>
        /// <returns>204 NoContent on success or 404 if not found.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _companyManager.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
