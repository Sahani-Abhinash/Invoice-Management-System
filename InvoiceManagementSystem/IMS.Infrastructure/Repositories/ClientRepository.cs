using IMS.Application.Interfaces;
using IMS.Domain.Entities.Company;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly AppDbContext _context;

        public ClientRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Company>> GetAllAsync()
            => await _context.Companies.ToListAsync();

        public async Task<Company?> GetByIdAsync(Guid id)
            => await _context.Companies.FindAsync(id);

        public async Task AddAsync(Company client)
        {
            _context.Companies.Add(client);
            await _context.SaveChangesAsync();
        }
    }
}