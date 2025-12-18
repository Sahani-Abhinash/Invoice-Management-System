using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Companies
{
    public class CompanyManager : ICompanyManager
    {
        private readonly ICompanyService _companyService;

        public CompanyManager(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        public async Task<IEnumerable<CompanyDto>> GetAllAsync()
        {
            return await _companyService.GetAllAsync();
        }

        public async Task<CompanyDto?> GetByIdAsync(Guid id)
        {
            return await _companyService.GetByIdAsync(id);
        }

        public async Task<CompanyDto> CreateAsync(CreateCompanyDto dto)
        {
            return await _companyService.CreateAsync(dto);
        }

        public async Task<CompanyDto?> UpdateAsync(Guid id, CreateCompanyDto dto)
        {
            return await _companyService.UpdateAsync(id, dto);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _companyService.DeleteAsync(id);
        }
    }
}
