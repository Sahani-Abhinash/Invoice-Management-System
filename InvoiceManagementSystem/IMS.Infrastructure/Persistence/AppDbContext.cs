using IMS.Domain.Entities.Companies;
using IMS.Domain.Entities.Pricing;
using IMS.Domain.Entities.Product;
using IMS.Domain.Entities.Security;
using IMS.Domain.Entities.Warehouse;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        private readonly IMS.Application.Interfaces.Common.ICurrentUserService? _currentUserService;

        public AppDbContext(DbContextOptions<AppDbContext> options, IMS.Application.Interfaces.Common.ICurrentUserService? currentUserService = null)
        : base(options)
        {
            _currentUserService = currentUserService;
        }

        // Optional: a service to provide current user id when setting audit fields
        public Guid? CurrentUserId { get; set; }

        // ---------------------
        // Companies / Branches
        // ---------------------
        public DbSet<Company> Companies => Set<Company>();
        public DbSet<Branch> Branches => Set<Branch>();

        // ---------------------
        // Warehouses / Inventory
        // ---------------------
        public DbSet<Warehouse> Warehouses => Set<Warehouse>();
        public DbSet<Stock> Stocks => Set<Stock>();
        public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();

        // ---------------------
        // Geography
        // ---------------------
        public DbSet<IMS.Domain.Entities.Geography.Country> Countries => Set<IMS.Domain.Entities.Geography.Country>();
        public DbSet<IMS.Domain.Entities.Geography.State> States => Set<IMS.Domain.Entities.Geography.State>();
        public DbSet<IMS.Domain.Entities.Geography.City> Cities => Set<IMS.Domain.Entities.Geography.City>();
        public DbSet<IMS.Domain.Entities.Geography.PostalCode> PostalCodes => Set<IMS.Domain.Entities.Geography.PostalCode>();

        // ---------------------
        // Products / Items
        // ---------------------
        public DbSet<Item> Items => Set<Item>();
        public DbSet<ItemImage> ItemImages => Set<ItemImage>();
        public DbSet<UnitOfMeasure> UnitOfMeasures => Set<UnitOfMeasure>();

        // ---------------------
        // Pricing
        // ---------------------
        public DbSet<PriceList> PriceLists => Set<PriceList>();
        public DbSet<ItemPrice> ItemPrices => Set<ItemPrice>();

        // ---------------------
        // Security / Users / Roles
        // ---------------------
        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

        // ---------------------
        // Common / Addressing
        // ---------------------
        public DbSet<IMS.Domain.Entities.Common.Address> Addresses => Set<IMS.Domain.Entities.Common.Address>();
        public DbSet<IMS.Domain.Entities.Common.EntityAddress> EntityAddresses => Set<IMS.Domain.Entities.Common.EntityAddress>();

        // ---------------------
        // Invoice (Coming Next)
        // ---------------------
        // public DbSet<Invoice> Invoices => Set<Invoice>();
        // public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
        // public DbSet<Payment> Payments => Set<Payment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            modelBuilder.Entity<IMS.Domain.Entities.Common.EntityAddress>(b =>
            {
                // composite key using enum OwnerType + OwnerId + AddressId
                b.HasKey(ea => new { ea.OwnerType, ea.OwnerId, ea.AddressId });

                // store enum as string for readability and extensibility
                b.Property(e => e.OwnerType)
                    .HasConversion<string>()
                    .HasMaxLength(50);

                // index to speed lookups by owner
                b.HasIndex(e => new { e.OwnerType, e.OwnerId });
            });

            // Configure RowVersion and soft-delete filter for BaseEntity
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(IMS.Domain.Common.BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType).Property("RowVersion").IsRowVersion();
                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(GetIsDeletedRestriction(entityType.ClrType));
                }
            }

            // Apply all configurations in the assembly automatically
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            base.OnModelCreating(modelBuilder);
        }

        private static LambdaExpression GetIsDeletedRestriction(Type type)
        {
            var param = Expression.Parameter(type, "e");
            var prop = Expression.Property(param, "IsDeleted");
            var condition = Expression.Equal(prop, Expression.Constant(false));
            return Expression.Lambda(condition, param);
        }

        public override int SaveChanges()
        {
            if (_currentUserService != null) CurrentUserId = _currentUserService.UserId;
            SetAuditFields();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            if (_currentUserService != null) CurrentUserId = _currentUserService.UserId;
            SetAuditFields();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void SetAuditFields()
        {
            var entries = ChangeTracker.Entries().Where(e => e.Entity is IMS.Domain.Common.BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted));
            var now = DateTime.UtcNow;
            foreach (var entry in entries)
            {
                var entity = (IMS.Domain.Common.BaseEntity)entry.Entity;
                if (entry.State == EntityState.Added)
                {
                    entity.CreatedAt = now;
                    if (CurrentUserId.HasValue) entity.CreatedBy = CurrentUserId;
                }
                if (entry.State == EntityState.Modified)
                {
                    entity.UpdatedAt = now;
                    if (CurrentUserId.HasValue) entity.UpdatedBy = CurrentUserId;
                }
                if (entry.State == EntityState.Deleted)
                {
                    // soft-delete
                    entry.State = EntityState.Modified;
                    entity.IsDeleted = true;
                    entity.IsActive = false;
                    entity.DeletedAt = now;
                    if (CurrentUserId.HasValue) entity.DeletedBy = CurrentUserId;
                }
            }
        }
    }
}
