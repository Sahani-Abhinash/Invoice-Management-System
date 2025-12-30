using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using IMS.Application.Interfaces.Common;
using IMS.Domain.Entities.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Services.Companies
{
    public class CustomerService : ICustomerService
    {
        private readonly IRepository<Customer> _repository;
        private readonly IRepository<Branch> _branchRepository;

        public CustomerService(IRepository<Customer> repository, IRepository<Branch> branchRepository)
        {
            _repository = repository;
            _branchRepository = branchRepository;
        }

        public async Task<IEnumerable<CustomerDto>> GetAllAsync()
        {
            var customers = await _repository.GetAllAsync(c => c.Branch);
            return customers.Select(c => MapToDto(c, c.Branch));
        }

        public async Task<CustomerDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id, c => c.Branch);
            if (entity == null) return null;
            return MapToDto(entity, entity.Branch);
        }

        public async Task<IEnumerable<CustomerDto>> GetByBranchIdAsync(Guid branchId)
        {
            var customers = await _repository.GetAllAsync(c => c.Branch);
            customers = customers.Where(c => c.BranchId == branchId);
            return customers.Select(c => MapToDto(c, c.Branch));
        }

        public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
        {
            var entity = new Customer
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                ContactName = dto.ContactName,
                Email = dto.Email,
                Phone = dto.Phone,
                TaxNumber = dto.TaxNumber,
                BranchId = dto.BranchId,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            var branch = dto.BranchId.HasValue ? await _branchRepository.GetByIdAsync(dto.BranchId.Value) : null;
            return MapToDto(entity, branch);
        }

        public async Task<CustomerDto?> UpdateAsync(Guid id, CreateCustomerDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            if (entity.IsDeleted || !entity.IsActive) return null;

            entity.Name = dto.Name;
            entity.ContactName = dto.ContactName;
            entity.Email = dto.Email;
            entity.Phone = dto.Phone;
            entity.TaxNumber = dto.TaxNumber;
            entity.BranchId = dto.BranchId;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            var branch = dto.BranchId.HasValue ? await _branchRepository.GetByIdAsync(dto.BranchId.Value) : null;
            return MapToDto(entity, branch);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;
            if (entity.IsDeleted) return false;

            _repository.Delete(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        private CustomerDto MapToDto(Customer c, Branch? b)
        {
            return new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                ContactName = c.ContactName,
                Email = c.Email,
                Phone = c.Phone,
                TaxNumber = c.TaxNumber,
                BranchId = c.BranchId,
                Branch = b != null ? new BranchDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    AddressId = null,
                    Address = null
                } : null
            };
        }
    }
}
