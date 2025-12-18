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
        Task<IEnumerable<BranchDto>> GetAllAsync();
        Task<BranchDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<BranchDto>> GetByCompanyIdAsync(Guid companyId);
        Task<BranchDto> CreateAsync(CreateBranchDto dto);
        Task<BranchDto?> UpdateAsync(Guid id, CreateBranchDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
