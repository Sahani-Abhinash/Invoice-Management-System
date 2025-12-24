using IMS.Application.Interfaces.Common;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Repositories.Common
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            // Return all active (non-deleted) items for entities inheriting BaseEntity
            if (typeof(IMS.Domain.Common.BaseEntity).IsAssignableFrom(typeof(T)))
            {
                return await _dbSet
                    .Where(e => !EF.Property<bool>(e, "IsDeleted") && EF.Property<bool>(e, "IsActive"))
                    .ToListAsync();
            }

            return await _dbSet.ToListAsync();
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(params System.Linq.Expressions.Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            if (typeof(IMS.Domain.Common.BaseEntity).IsAssignableFrom(typeof(T)))
            {
                query = query.Where(e => !EF.Property<bool>(e, "IsDeleted") && EF.Property<bool>(e, "IsActive"));
            }

            return await query.ToListAsync();
        }

        public virtual async Task<T?> GetByIdAsync(Guid id)
        {
            // Prefer FindAsync for direct lookup then enforce soft-delete/active checks
            var entity = await _dbSet.FindAsync(id);
            if (entity == null) return null;

            if (entity is IMS.Domain.Common.BaseEntity be)
            {
                if (be.IsDeleted || !be.IsActive) return null;
            }

            return entity;
        }

        public virtual async Task<T?> GetByIdAsync(Guid id, params System.Linq.Expressions.Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            var entity = await query.FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id);
            if (entity == null) return null;
            if (entity is IMS.Domain.Common.BaseEntity be)
            {
                if (be.IsDeleted || !be.IsActive) return null;
            }
            return entity;
        }

        public virtual IQueryable<T> GetQueryable()
        {
            return _dbSet.AsQueryable();
        }

        // Admin methods - return records regardless of IsDeleted/IsActive flags
        public virtual async Task<IEnumerable<T>> GetAllAdminAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<IEnumerable<T>> GetAllAdminAsync(params System.Linq.Expressions.Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            return await query.ToListAsync();
        }

        public virtual async Task<T?> GetByIdAdminAsync(Guid id)
        {
            var entity = await _dbSet.FindAsync(id);
            return entity;
        }

        public virtual async Task<T?> GetByIdAdminAsync(Guid id, params System.Linq.Expressions.Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            var entity = await query.FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id);
            return entity;
        }

        public virtual async Task AddAsync(T entity)
        {
            // Ensure default audit/soft-delete flags for BaseEntity
            if (entity is IMS.Domain.Common.BaseEntity be)
            {
                be.IsActive = true;
                be.IsDeleted = false;
                // CreatedAt default already set on BaseEntity; other audit fields set in DbContext
            }

            await _dbSet.AddAsync(entity);
        }

        public virtual async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public virtual void Update(T entity)
        {
            _dbSet.Update(entity);
        }

        public virtual void UpdateRange(IEnumerable<T> entities)
        {
            _dbSet.UpdateRange(entities);
        }

        public virtual void Delete(T entity)
        {
            // If already soft-deleted, skip
            if (entity is IMS.Domain.Common.BaseEntity be)
            {
                if (be.IsDeleted) return;
            }

            _dbSet.Remove(entity);
        }

        public virtual void DeleteRange(IEnumerable<T> entities)
        {
            var list = entities.ToList();
            // prevent removing already-deleted entities
            var toRemove = list.Where(e => !(e is IMS.Domain.Common.BaseEntity be && be.IsDeleted)).ToList();
            if (toRemove.Any()) _dbSet.RemoveRange(toRemove);
        }

        public virtual async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
