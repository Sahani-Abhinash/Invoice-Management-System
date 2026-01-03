using IMS.Application.DTOs.Companies;
using IMS.Application.Managers.Companies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;

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

        /// <summary>
        /// Uploads a company logo (replaces existing logo if present).
        /// </summary>
        /// <param name="id">Company identifier.</param>
        /// <returns>200 OK with logo URL or error response.</returns>
        [HttpPost("{id}/upload-logo")]
        public async Task<IActionResult> UploadLogo(Guid id, IFormFile file)
        {
            // Validate file
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Check file size (max 2MB)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest("File size exceeds 2MB limit");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Invalid file type. Allowed: JPG, PNG, GIF");

            try
            {
                // Get company
                var company = await _companyManager.GetByIdAsync(id);
                if (company == null)
                    return NotFound("Company not found");

                // Create uploads directory if it doesn't exist
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "logos");
                Directory.CreateDirectory(uploadsDir);

                // Delete old logo if it exists
                if (!string.IsNullOrEmpty(company.LogoUrl))
                {
                    // Extract filename from URL and delete file
                    var oldFileName = Path.GetFileName(company.LogoUrl);
                    var oldFilePath = Path.Combine(uploadsDir, oldFileName);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Save new file with simple naming: {companyId}.{extension}
                var fileName = $"{id}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Build URL
                var logoUrl = $"/uploads/logos/{fileName}";

                // Update company with logo URL
                var updateDto = new CreateCompanyDto
                {
                    Name = company.Name,
                    TaxNumber = company.TaxNumber,
                    Email = company.Email,
                    Phone = company.Phone,
                    LogoUrl = logoUrl,
                    DefaultCurrencyId = company.DefaultCurrencyId
                };

                var updated = await _companyManager.UpdateAsync(id, updateDto);

                return Ok(new { logoUrl = logoUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading logo: {ex.Message}");
            }
        }
    }
}
