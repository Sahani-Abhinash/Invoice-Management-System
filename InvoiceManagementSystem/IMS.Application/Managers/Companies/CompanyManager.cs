using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Companies
{
    /// <summary>
    /// Manager coordinating company operations. Acts as a facade over ICompanyService.
    /// </summary>
    public class CompanyManager : ICompanyManager
    {
        /// <summary>
        /// Underlying company service used to perform business operations.
        /// </summary>
        private readonly ICompanyService _companyService;

        /// <summary>
        /// Create a new instance of CompanyManager.
        /// </summary>
        public CompanyManager(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        /// <summary>
        /// Get all companies.
        /// </summary>
        public async Task<IEnumerable<CompanyDto>> GetAllAsync()
        {
            return await _companyService.GetAllAsync();
        }

        /// <summary>
        /// Get company by id.
        /// </summary>
        public async Task<CompanyDto?> GetByIdAsync(Guid id)
        {
            return await _companyService.GetByIdAsync(id);
        }

        /// <summary>
        /// Create a company.
        /// </summary>
        public async Task<CompanyDto> CreateAsync(CreateCompanyDto dto)
        {
            return await _companyService.CreateAsync(dto);
        }

        /// <summary>
        /// Update company by id.
        /// </summary>
        public async Task<CompanyDto?> UpdateAsync(Guid id, CreateCompanyDto dto)
        {
            return await _companyService.UpdateAsync(id, dto);
        }

        /// <summary>
        /// Delete company by id (soft-delete).
        /// </summary>
        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _companyService.DeleteAsync(id);
        }
    }
}
