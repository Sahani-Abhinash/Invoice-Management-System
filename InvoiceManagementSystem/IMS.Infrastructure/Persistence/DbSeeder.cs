using IMS.Application.Common;
using IMS.Domain.Entities.Companies;
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
        // Permissions (ensure all constants from Permissions class exist)
        // --------------------------
        {
            var permissionNames = typeof(Permissions).GetFields()
                .Select(f => f.GetValue(null)?.ToString())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Distinct()
                .ToList();

            // Get existing permission names from DB
            var existingNames = context.Permissions.Select(p => p.Name).ToList();

            // Determine which permission constants are missing in DB
            var missing = permissionNames.Except(existingNames).ToList();

                if (missing.Any())
                {
                    var newPermissions = missing.Select(n => new Permission { Id = Guid.NewGuid(), Name = n!, IsActive = true, IsDeleted = false }).ToArray();
                    context.Permissions.AddRange(newPermissions);
                    context.SaveChanges();
                }
        }

        // --------------------------
        // Roles - ensure Admin role exists and has all permissions
        // --------------------------
        var adminRole = context.Roles.FirstOrDefault(r => r.Name == "Admin");
        if (adminRole == null)
        {
            adminRole = new Role { Id = Guid.NewGuid(), Name = "Admin", IsActive = true, IsDeleted = false };
            context.Roles.Add(adminRole);
            context.SaveChanges();
        }

        // Ensure admin role has links to all permissions
        var allPermissionIds = context.Permissions.Select(p => p.Id).ToList();
        var existingForAdmin = context.RolePermissions
            .Where(rp => rp.RoleId == adminRole.Id)
            .Select(rp => rp.PermissionId)
            .ToList();

        var missingForAdmin = allPermissionIds.Except(existingForAdmin).ToList();
        if (missingForAdmin.Any())
        {
            var newRolePerms = missingForAdmin.Select(pid => new RolePermission { RoleId = adminRole.Id, PermissionId = pid }).ToArray();
            context.RolePermissions.AddRange(newRolePerms);
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
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@ims.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"), // Use BCrypt or preferred hash
                IsActive = true,
                IsDeleted = false
            };
            context.Users.Add(adminUser);
            context.SaveChanges();

            // Assign Admin role
            adminRole = context.Roles.First(r => r.Name == "Admin");
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
            var company1 = new Company { Id = Guid.NewGuid(), Name = "ABC Pvt Ltd", TaxNumber = "TAX123456", IsActive = true, IsDeleted = false };
            var company2 = new Company { Id = Guid.NewGuid(), Name = "XYZ GmbH", TaxNumber = "TAX654321", IsActive = true, IsDeleted = false };
            context.Companies.AddRange(company1, company2);
            context.SaveChanges();
            var branch1 = new Branch { Id = Guid.NewGuid(), Name = "ABC Delhi Branch", Address = "Delhi, India", CompanyId = company1.Id, IsActive = true, IsDeleted = false };
            var branch2 = new Branch { Id = Guid.NewGuid(), Name = "XYZ Berlin Branch", Address = "Berlin, Germany", CompanyId = company2.Id, IsActive = true, IsDeleted = false };
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

            var warehouse1 = new Warehouse { Id = Guid.NewGuid(), Name = "ABC Delhi Main Warehouse", BranchId = branch1.Id, IsActive = true, IsDeleted = false };
            var warehouse2 = new Warehouse { Id = Guid.NewGuid(), Name = "XYZ Berlin Central Warehouse", BranchId = branch2.Id, IsActive = true, IsDeleted = false };
            context.Warehouses.AddRange(warehouse1, warehouse2);
            context.SaveChanges();
        }

        // --------------------------
        // Geography: Countries, States, Cities, PostalCodes
        // --------------------------
        if (!context.Countries.Any())
        {
            var india = new IMS.Domain.Entities.Geography.Country { Id = Guid.NewGuid(), Name = "India", ISOCode = "IN", IsActive = true, IsDeleted = false };
            var germany = new IMS.Domain.Entities.Geography.Country { Id = Guid.NewGuid(), Name = "Germany", ISOCode = "DE", IsActive = true, IsDeleted = false };
            context.Countries.AddRange(india, germany);
            context.SaveChanges();

            var delhiState = new IMS.Domain.Entities.Geography.State { Id = Guid.NewGuid(), Name = "Delhi", CountryId = india.Id, IsActive = true, IsDeleted = false };
            var berlinState = new IMS.Domain.Entities.Geography.State { Id = Guid.NewGuid(), Name = "Berlin", CountryId = germany.Id, IsActive = true, IsDeleted = false };
            context.States.AddRange(delhiState, berlinState);
            context.SaveChanges();

            var delhiCity = new IMS.Domain.Entities.Geography.City { Id = Guid.NewGuid(), Name = "New Delhi", StateId = delhiState.Id, IsActive = true, IsDeleted = false };
            var berlinCity = new IMS.Domain.Entities.Geography.City { Id = Guid.NewGuid(), Name = "Berlin", StateId = berlinState.Id, IsActive = true, IsDeleted = false };
            context.Cities.AddRange(delhiCity, berlinCity);
            context.SaveChanges();

            var delhiPostal = new IMS.Domain.Entities.Geography.PostalCode { Id = Guid.NewGuid(), Code = "110001", CityId = delhiCity.Id, IsActive = true, IsDeleted = false };
            var berlinPostal = new IMS.Domain.Entities.Geography.PostalCode { Id = Guid.NewGuid(), Code = "10115", CityId = berlinCity.Id, IsActive = true, IsDeleted = false };
            context.PostalCodes.AddRange(delhiPostal, berlinPostal);
            context.SaveChanges();
        }

        // --------------------------
        // UnitOfMeasure
        // --------------------------
        if (!context.UnitOfMeasures.Any())
        {
            var uoms = new[]
            {
                new UnitOfMeasure { Id = Guid.NewGuid(), Name = "Piece", Symbol = "pcs", IsActive = true, IsDeleted = false },
                new UnitOfMeasure { Id = Guid.NewGuid(), Name = "Kilogram", Symbol = "kg", IsActive = true, IsDeleted = false }
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
                new PriceList { Id = Guid.NewGuid(), Name = "Retail", IsDefault = true, IsActive = true, IsDeleted = false },
                new PriceList { Id = Guid.NewGuid(), Name = "Wholesale", IsDefault = false, IsActive = true, IsDeleted = false }
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
                UnitOfMeasureId = uomPiece.Id,
                IsActive = true,
                IsDeleted = false
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
                    EffectiveFrom = DateTime.Now,
                    IsActive = true,
                    IsDeleted = false
                },
                new ItemPrice
                {
                    Id = Guid.NewGuid(),
                    ItemId = item1.Id,
                    PriceListId = wholesalePriceList.Id,
                    Price = 90,
                    EffectiveFrom = DateTime.Now,
                    IsActive = true,
                    IsDeleted = false
                }
            };
            context.ItemPrices.AddRange(prices);
            context.SaveChanges();
        }
    }
}
