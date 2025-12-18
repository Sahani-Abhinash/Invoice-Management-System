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
    public class BranchService : IBranchService
    {
        private readonly IRepository<Branch> _repository;
        private readonly IRepository<Company> _companyRepository;

        public BranchService(IRepository<Branch> repository, IRepository<Company> companyRepository)
        {
            _repository = repository;
            _companyRepository = companyRepository;
        }

        public async Task<IEnumerable<BranchDto>> GetAllAsync()
        {
            var branches = await _repository.GetQueryable()
                .Include(b => b.Company)
                .ToListAsync();

            return branches.Select(b => MapToDto(b, b.Company!)).ToList();
        }

        public async Task<BranchDto?> GetByIdAsync(Guid id)
        {
            var branchEntity = await _repository.GetQueryable()
                .Include(b => b.Company)
                .FirstOrDefaultAsync(b => b.Id == id);
            
            if (branchEntity == null) return null;

            return MapToDto(branchEntity, branchEntity.Company!);
        }

        public async Task<IEnumerable<BranchDto>> GetByCompanyIdAsync(Guid companyId)
        {
            var branches = await _repository.GetQueryable()
                .Where(b => b.CompanyId == companyId)
                .Include(b => b.Company)
                .ToListAsync();

            return branches.Select(b => MapToDto(b, b.Company!)).ToList();
        }

        public async Task<BranchDto> CreateAsync(CreateBranchDto dto)
        {
            var branchEntity = new Branch
            {
                Id = Guid.NewGuid(),
                CompanyId = dto.CompanyId,
                Name = dto.Name,
                Address = dto.Address
            };

            await _repository.AddAsync(branchEntity);
            await _repository.SaveChangesAsync();

            var company = await _companyRepository.GetByIdAsync(branchEntity.CompanyId);
            return MapToDto(branchEntity, company!);
        }

        public async Task<BranchDto?> UpdateAsync(Guid id, CreateBranchDto dto)
        {
            var branchEntity = await _repository.GetByIdAsync(id);
            if (branchEntity == null) return null;

            branchEntity.CompanyId = dto.CompanyId;
            branchEntity.Name = dto.Name;
            branchEntity.Address = dto.Address;

            _repository.Update(branchEntity);
            await _repository.SaveChangesAsync();

            var company = await _companyRepository.GetByIdAsync(branchEntity.CompanyId);
            return MapToDto(branchEntity, company!);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var branchEntity = await _repository.GetByIdAsync(id);
            if (branchEntity == null) return false;

            _repository.Delete(branchEntity);
            await _repository.SaveChangesAsync();
            return true;
        }

        private BranchDto MapToDto(Branch branch, Company company)
        {
            return new BranchDto
            {
                Id = branch.Id,
                Name = branch.Name,
                Address = branch.Address,
                Company = new CompanyDto
                {
                    Id = company.Id,
                    Name = company.Name,
                    TaxNumber = company.TaxNumber
                }
            };
        }
    }
}
