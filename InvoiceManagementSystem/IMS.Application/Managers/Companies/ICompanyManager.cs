using IMS.Application.DTOs.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Companies
{
    public interface ICompanyManager
    {
        /// <summary>
        /// Get all companies.
        /// </summary>
        Task<IEnumerable<CompanyDto>> GetAllAsync();

        /// <summary>
        /// Get company by id.
        /// </summary>
        Task<CompanyDto?> GetByIdAsync(Guid id);

        /// <summary>
        /// Create a company.
        /// </summary>
        Task<CompanyDto> CreateAsync(CreateCompanyDto dto);

        /// <summary>
        /// Update company by id.
        /// </summary>
        Task<CompanyDto?> UpdateAsync(Guid id, CreateCompanyDto dto);

        /// <summary>
        /// Delete company by id (soft-delete).
        /// </summary>
        Task<bool> DeleteAsync(Guid id);
    }
}
