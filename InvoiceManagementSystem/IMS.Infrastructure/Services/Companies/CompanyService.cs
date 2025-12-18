using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Companies
{
    public class CompanyService : ICompanyService
    {
        private readonly IRepository<Company> _repository;

        public CompanyService(IRepository<Company> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CompanyDto>> GetAllAsync()
        {
            var companies = await _repository.GetAllAsync();
            return companies.Select(c => new CompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                TaxNumber = c.TaxNumber
            }).ToList();
        }

        public async Task<CompanyDto?> GetByIdAsync(Guid id)
        {
            var companyEntity = await _repository.GetByIdAsync(id);
            if (companyEntity == null) return null;

            return new CompanyDto
            {
                Id = companyEntity.Id,
                Name = companyEntity.Name,
                TaxNumber = companyEntity.TaxNumber
            };
        }

        public async Task<CompanyDto> CreateAsync(CreateCompanyDto dto)
        {
            var companyEntity = new Company
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                TaxNumber = dto.TaxNumber
            };

            await _repository.AddAsync(companyEntity);
            await _repository.SaveChangesAsync();

            return new CompanyDto
            {
                Id = companyEntity.Id,
                Name = companyEntity.Name,
                TaxNumber = companyEntity.TaxNumber
            };
        }

        public async Task<CompanyDto?> UpdateAsync(Guid id, CreateCompanyDto dto)
        {
            var companyEntity = await _repository.GetByIdAsync(id);
            if (companyEntity == null) return null;

            companyEntity.Name = dto.Name;
            companyEntity.TaxNumber = dto.TaxNumber;

            _repository.Update(companyEntity);
            await _repository.SaveChangesAsync();

            return new CompanyDto
            {
                Id = companyEntity.Id,
                Name = companyEntity.Name,
                TaxNumber = companyEntity.TaxNumber
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var companyEntity = await _repository.GetByIdAsync(id);
            if (companyEntity == null) return false;

            _repository.Delete(companyEntity);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
