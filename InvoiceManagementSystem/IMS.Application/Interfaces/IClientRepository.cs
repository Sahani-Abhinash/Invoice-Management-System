using IMS.Domain.Entities.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using company = IMS.Domain.Entities.Companies;

namespace IMS.Application.Interfaces
{
    public interface IClientRepository
    {
        Task<IEnumerable<company.Company>> GetAllAsync();
        Task<company.Company?> GetByIdAsync(Guid id);
        Task AddAsync(company.Company client);
    }
}
