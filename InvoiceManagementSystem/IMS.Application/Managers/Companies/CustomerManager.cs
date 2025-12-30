using IMS.Application.DTOs.Companies;
using IMS.Application.Interfaces.Companies;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Companies
{
    public class CustomerManager : ICustomerManager
    {
        private readonly ICustomerService _customerService;

        public CustomerManager(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        public async Task<IEnumerable<CustomerDto>> GetAllAsync() => await _customerService.GetAllAsync();

        public async Task<CustomerDto?> GetByIdAsync(Guid id) => await _customerService.GetByIdAsync(id);

        public async Task<IEnumerable<CustomerDto>> GetByBranchIdAsync(Guid branchId) => await _customerService.GetByBranchIdAsync(branchId);

        public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto) => await _customerService.CreateAsync(dto);

        public async Task<CustomerDto?> UpdateAsync(Guid id, CreateCustomerDto dto) => await _customerService.UpdateAsync(id, dto);

        public async Task<bool> DeleteAsync(Guid id) => await _customerService.DeleteAsync(id);
    }
}
