using IMS.Application.DTOs.Company;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Company
{
    public interface ICompanyService
    {
        Task<IEnumerable<CompanyDto>> GetAllAsync();
        Task<CompanyDto?> GetByIdAsync(Guid id);
        Task<CompanyDto> CreateAsync(CreateCompanyDto dto);
        Task<CompanyDto?> UpdateAsync(Guid id, CreateCompanyDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
