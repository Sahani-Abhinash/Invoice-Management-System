using IMS.Application.DTOs.Company;
using IMS.Application.Interfaces.Company;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using company = IMS.Domain.Entities.Company;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Company
{
    public class CompanyService : ICompanyService
    {
        private readonly AppDbContext _context;

        public CompanyService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CompanyDto>> GetAllAsync()
        {
            return await _context.Companies
                .Select(c => new CompanyDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    TaxNumber = c.TaxNumber
                })
                .ToListAsync();
        }

        public async Task<CompanyDto?> GetByIdAsync(Guid id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return null;

            return new CompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                TaxNumber = company.TaxNumber
            };
        }

        public async Task<CompanyDto> CreateAsync(CreateCompanyDto dto)
        {
            var company = new company.Company
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                TaxNumber = dto.TaxNumber
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return new CompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                TaxNumber = company.TaxNumber
            };
        }

        public async Task<CompanyDto?> UpdateAsync(Guid id, CreateCompanyDto dto)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return null;

            company.Name = dto.Name;
            company.TaxNumber = dto.TaxNumber;

            await _context.SaveChangesAsync();

            return new CompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                TaxNumber = company.TaxNumber
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return false;

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
