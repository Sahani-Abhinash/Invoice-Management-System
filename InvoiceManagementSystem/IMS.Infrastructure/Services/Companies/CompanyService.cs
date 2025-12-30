using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Companies;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Companies
{
    public class CompanyService : ICompanyService
    {
        /// <summary>
        /// Repository for company entities.
        /// </summary>
        private readonly IRepository<Company> _repository;

        /// <summary>
        /// Constructs the CompanyService with the provided repository.
        /// </summary>
        public CompanyService(IRepository<Company> repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Retrieves all companies and maps to DTOs.
        /// </summary>
        public async Task<IEnumerable<CompanyDto>> GetAllAsync()
        {
            var companies = await _repository.GetAllAsync();

            return companies.Select(c => new CompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                TaxNumber = c.TaxNumber,
                Email = c.Email,
                Phone = c.Phone,
                LogoUrl = c.LogoUrl
            }).ToList();
        }

        /// <summary>
        /// Retrieves a company by id.
        /// </summary>
        public async Task<CompanyDto?> GetByIdAsync(Guid id)
        {
            var companyEntity = await _repository.GetByIdAsync(id);
            if (companyEntity == null) return null;

            return new CompanyDto
            {
                Id = companyEntity.Id,
                Name = companyEntity.Name,
                TaxNumber = companyEntity.TaxNumber
                ,
                Email = companyEntity.Email,
                Phone = companyEntity.Phone,
                LogoUrl = companyEntity.LogoUrl
            };
        }

        /// <summary>
        /// Creates a new company entity from DTO and persists it.
        /// </summary>
        public async Task<CompanyDto> CreateAsync(CreateCompanyDto dto)
        {
            var companyEntity = new Company
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                TaxNumber = dto.TaxNumber
                ,
                Email = dto.Email,
                Phone = dto.Phone,
                LogoUrl = dto.LogoUrl
                // BaseEntity defaults will be enforced in repository AddAsync
            };

            await _repository.AddAsync(companyEntity);
            await _repository.SaveChangesAsync();

            return new CompanyDto
            {
                Id = companyEntity.Id,
                Name = companyEntity.Name,
                TaxNumber = companyEntity.TaxNumber
                ,
                Email = companyEntity.Email,
                Phone = companyEntity.Phone,
                LogoUrl = companyEntity.LogoUrl
            };
        }

        /// <summary>
        /// Updates an existing company.
        /// </summary>
        public async Task<CompanyDto?> UpdateAsync(Guid id, CreateCompanyDto dto)
        {
            var companyEntity = await _repository.GetByIdAsync(id);
            if (companyEntity == null) return null;

            if (companyEntity is IMS.Domain.Common.BaseEntity be && (be.IsDeleted || !be.IsActive)) return null;

            companyEntity.Name = dto.Name;
            companyEntity.TaxNumber = dto.TaxNumber;
            companyEntity.Email = dto.Email;
            companyEntity.Phone = dto.Phone;
            companyEntity.LogoUrl = dto.LogoUrl;
            // Address linking should be done via AddressService EntityAddress links, not a direct property on Company.

            _repository.Update(companyEntity);
            await _repository.SaveChangesAsync();

            return new CompanyDto
            {
                Id = companyEntity.Id,
                Name = companyEntity.Name,
                TaxNumber = companyEntity.TaxNumber
            };
        }

        /// <summary>
        /// Deletes (soft-delete) a company by id.
        /// </summary>
        public async Task<bool> DeleteAsync(Guid id)
        {
            var companyEntity = await _repository.GetByIdAsync(id);
            if (companyEntity == null) return false;

            if (companyEntity is IMS.Domain.Common.BaseEntity be && be.IsDeleted) return false;

            _repository.Delete(companyEntity);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
