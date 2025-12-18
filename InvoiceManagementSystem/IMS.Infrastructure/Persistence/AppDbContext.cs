using IMS.Domain.Entities.Company;
using IMS.Domain.Entities.Pricing;
using IMS.Domain.Entities.Product;
using IMS.Domain.Entities.Security;
using IMS.Domain.Entities.Warehouse;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }

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

            // Apply all configurations in the assembly automatically
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            base.OnModelCreating(modelBuilder);
        }
    }
}
