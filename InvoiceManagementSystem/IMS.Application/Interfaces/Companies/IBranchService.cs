using IMS.Application.DTOs.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Companies
{
    public interface IBranchService
    {
        /// <summary>
        /// Retrieves all branches.
        /// </summary>
        Task<IEnumerable<BranchDto>> GetAllAsync();

        /// <summary>
        /// Retrieves branch by identifier.
        /// </summary>
        Task<BranchDto?> GetByIdAsync(Guid id);

        /// <summary>
        /// Retrieves branches belonging to a specific company.
        /// </summary>
        Task<IEnumerable<BranchDto>> GetByCompanyIdAsync(Guid companyId);

        /// <summary>
        /// Creates a new branch.
        /// </summary>
        Task<BranchDto> CreateAsync(CreateBranchDto dto);

        /// <summary>
        /// Updates an existing branch.
        /// </summary>
        Task<BranchDto?> UpdateAsync(Guid id, CreateBranchDto dto);

        /// <summary>
        /// Deletes (soft-delete) a branch by id.
        /// </summary>
        Task<bool> DeleteAsync(Guid id);
    }
}
