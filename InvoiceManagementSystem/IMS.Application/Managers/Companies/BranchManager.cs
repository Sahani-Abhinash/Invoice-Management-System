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
    /// Manager coordinating branch operations. Delegates to IBranchService.
    /// </summary>
    public class BranchManager : IBranchManager
    {
        private readonly IBranchService _branchService;

        public BranchManager(IBranchService branchService)
        {
            _branchService = branchService;
        }

        public async Task<IEnumerable<BranchDto>> GetAllAsync()
        {
            return await _branchService.GetAllAsync();
        }

        public async Task<BranchDto?> GetByIdAsync(Guid id)
        {
            return await _branchService.GetByIdAsync(id);
        }

        public async Task<IEnumerable<BranchDto>> GetByCompanyIdAsync(Guid companyId)
        {
            throw new System.NotSupportedException("Branches are independent; use GetAllAsync and filter client-side if needed.");
        }

        public async Task<BranchDto> CreateAsync(CreateBranchDto dto)
        {
            return await _branchService.CreateAsync(dto);
        }

        public async Task<BranchDto?> UpdateAsync(Guid id, CreateBranchDto dto)
        {
            return await _branchService.UpdateAsync(id, dto);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _branchService.DeleteAsync(id);
        }
    }
}
