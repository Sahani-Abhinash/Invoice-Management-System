using IMS.Application.DTOs.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Companies
{
    public interface IBranchManager
    {
        /// <summary>
        /// Retrieves all branches.
        /// </summary>
        Task<IEnumerable<BranchDto>> GetAllAsync();

        /// <summary>
        /// Retrieves a branch by identifier.
        /// </summary>
        Task<BranchDto?> GetByIdAsync(Guid id);

        /// <summary>
        /// Retrieves branches by company identifier.
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
