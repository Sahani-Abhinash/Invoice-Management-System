using IMS.Application.Common;
using IMS.Domain.Entities.Company;
using IMS.Domain.Entities.Pricing;
using IMS.Domain.Entities.Product;
using IMS.Domain.Entities.Security;
using IMS.Domain.Entities.Warehouse;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Persistence;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        context.Database.Migrate(); // Ensure database is created and latest migration applied

        // --------------------------
        // Permissions
        // --------------------------
        if (!context.Permissions.Any())
        {
            var permissions = new[]
            {
                new Permission { Id = Guid.NewGuid(), Name = Permissions.ManageUsers },
                new Permission { Id = Guid.NewGuid(), Name = Permissions.ManageInventory },
                new Permission { Id = Guid.NewGuid(), Name = Permissions.CreateInvoice },
                new Permission { Id = Guid.NewGuid(), Name = Permissions.PayInvoice }
            };
            context.Permissions.AddRange(permissions);
            context.SaveChanges();
        }

        // --------------------------
        // Roles
        // --------------------------
        if (!context.Roles.Any())
        {
            var adminRole = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin"
            };
            context.Roles.Add(adminRole);
            context.SaveChanges();

            // Assign all permissions to Admin
            var rolePermissions = context.Permissions
                .Select(p => new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = p.Id
                }).ToList();
            context.RolePermissions.AddRange(rolePermissions);
            context.SaveChanges();
        }

        // --------------------------
        // Admin User
        // --------------------------
        if (!context.Users.Any())
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Admin User",
                Email = "admin@ims.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123") // Use BCrypt or preferred hash
            };
            context.Users.Add(adminUser);
            context.SaveChanges();

            // Assign Admin role
            var adminRole = context.Roles.First(r => r.Name == "Admin");
            context.UserRoles.Add(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            });
            context.SaveChanges();
        }

        // --------------------------
        // Companies & Branches
        // --------------------------
        if (!context.Companies.Any())
        {
            var company1 = new Company { Id = Guid.NewGuid(), Name = "ABC Pvt Ltd", TaxNumber = "TAX123456" };
            var company2 = new Company { Id = Guid.NewGuid(), Name = "XYZ GmbH", TaxNumber = "TAX654321" };
            context.Companies.AddRange(company1, company2);
            context.SaveChanges();

            var branch1 = new Branch { Id = Guid.NewGuid(), Name = "ABC Delhi Branch", Address = "Delhi, India", CompanyId = company1.Id };
            var branch2 = new Branch { Id = Guid.NewGuid(), Name = "XYZ Berlin Branch", Address = "Berlin, Germany", CompanyId = company2.Id };
            context.Branches.AddRange(branch1, branch2);
            context.SaveChanges();
        }

        // --------------------------
        // Warehouses
        // --------------------------
        if (!context.Warehouses.Any())
        {
            var branch1 = context.Branches.First(b => b.Name == "ABC Delhi Branch");
            var branch2 = context.Branches.First(b => b.Name == "XYZ Berlin Branch");

            var warehouse1 = new Warehouse { Id = Guid.NewGuid(), Name = "ABC Delhi Main Warehouse", BranchId = branch1.Id };
            var warehouse2 = new Warehouse { Id = Guid.NewGuid(), Name = "XYZ Berlin Central Warehouse", BranchId = branch2.Id };
            context.Warehouses.AddRange(warehouse1, warehouse2);
            context.SaveChanges();
        }

        // --------------------------
        // UnitOfMeasure
        // --------------------------
        if (!context.UnitOfMeasures.Any())
        {
            var uoms = new[]
            {
                new UnitOfMeasure { Id = Guid.NewGuid(), Name = "Piece", Symbol = "pcs" },
                new UnitOfMeasure { Id = Guid.NewGuid(), Name = "Kilogram", Symbol = "kg" }
            };
            context.UnitOfMeasures.AddRange(uoms);
            context.SaveChanges();
        }

        // --------------------------
        // PriceLists
        // --------------------------
        if (!context.PriceLists.Any())
        {
            var priceLists = new[]
            {
                new PriceList { Id = Guid.NewGuid(), Name = "Retail", IsDefault = true },
                new PriceList { Id = Guid.NewGuid(), Name = "Wholesale", IsDefault = false }
            };
            context.PriceLists.AddRange(priceLists);
            context.SaveChanges();
        }

        // --------------------------
        // Sample Items + Prices
        // --------------------------
        if (!context.Items.Any())
        {
            var uomPiece = context.UnitOfMeasures.First(u => u.Name == "Piece");
            var retailPriceList = context.PriceLists.First(p => p.Name == "Retail");
            var wholesalePriceList = context.PriceLists.First(p => p.Name == "Wholesale");

            var item1 = new Item
            {
                Id = Guid.NewGuid(),
                Name = "Product A",
                SKU = "PRODA-001",
                UnitOfMeasureId = uomPiece.Id
            };
            context.Items.Add(item1);
            context.SaveChanges();

            var prices = new[]
            {
                new ItemPrice
                {
                    Id = Guid.NewGuid(),
                    ItemId = item1.Id,
                    PriceListId = retailPriceList.Id,
                    Price = 100,
                    EffectiveFrom = DateTime.Now
                },
                new ItemPrice
                {
                    Id = Guid.NewGuid(),
                    ItemId = item1.Id,
                    PriceListId = wholesalePriceList.Id,
                    Price = 90,
                    EffectiveFrom = DateTime.Now
                }
            };
            context.ItemPrices.AddRange(prices);
            context.SaveChanges();
        }
    }
}
