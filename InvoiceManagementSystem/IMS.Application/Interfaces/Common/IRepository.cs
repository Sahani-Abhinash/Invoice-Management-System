using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Common
{
    /// <summary>
    /// Generic repository abstraction used across the application for data access.
    /// Provides common CRUD and query operations for entities of type <typeparamref name="T"/>.
    /// Implementations encapsulate EF/Core or other persistence details.
    /// </summary>
    public interface IRepository<T> where T : class
    {
        // Read Operations
        /// <summary>
        /// Returns all entities (respecting soft-delete and active flags when applicable).
        /// </summary>
        Task<IEnumerable<T>> GetAllAsync();

        /// <summary>
        /// Returns the entity with the given identifier or null if not found.
        /// </summary>
        Task<T?> GetByIdAsync(Guid id);
        // Read with includes
        /// <summary>
        /// Returns all entities including the specified navigation properties.
        /// </summary>
        Task<IEnumerable<T>> GetAllAsync(params System.Linq.Expressions.Expression<Func<T, object>>[] includes);

        /// <summary>
        /// Returns the entity by id including specified navigation properties.
        /// </summary>
        Task<T?> GetByIdAsync(Guid id, params System.Linq.Expressions.Expression<Func<T, object>>[] includes);
        IQueryable<T> GetQueryable();

        // Admin retrieval (returns records regardless of IsDeleted/IsActive)
        /// <summary>
        /// Returns all records without applying soft-delete/IsActive filters (admin view).
        /// </summary>
        Task<IEnumerable<T>> GetAllAdminAsync();

        /// <summary>
        /// Returns all admin records including navigation properties.
        /// </summary>
        Task<IEnumerable<T>> GetAllAdminAsync(params System.Linq.Expressions.Expression<Func<T, object>>[] includes);

        /// <summary>
        /// Returns an entity by id ignoring soft-delete/IsActive checks.
        /// </summary>
        Task<T?> GetByIdAdminAsync(Guid id);

        /// <summary>
        /// Returns an entity by id including navigation properties for admin usage.
        /// </summary>
        Task<T?> GetByIdAdminAsync(Guid id, params System.Linq.Expressions.Expression<Func<T, object>>[] includes);

        // Write Operations
        /// <summary>
        /// Adds a new entity to the underlying store.
        /// </summary>
        Task AddAsync(T entity);

        /// <summary>
        /// Adds multiple entities to the underlying store.
        /// </summary>
        Task AddRangeAsync(IEnumerable<T> entities);

        /// <summary>
        /// Updates an entity in the underlying store.
        /// </summary>
        void Update(T entity);

        /// <summary>
        /// Updates multiple entities.
        /// </summary>
        void UpdateRange(IEnumerable<T> entities);

        /// <summary>
        /// Deletes an entity (implementation may perform soft-delete or remove from DB).
        /// </summary>
        void Delete(T entity);

        /// <summary>
        /// Deletes multiple entities.
        /// </summary>
        void DeleteRange(IEnumerable<T> entities);

        // SaveChanges
        Task<int> SaveChangesAsync();
    }
}
