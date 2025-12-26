using IMS.API.Authorization;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Application.Interfaces.Common;
using IMS.Application.Interfaces.Companies;
using IMS.Application.Managers.Companies;
using IMS.Infrastructure.Persistence;
using IMS.Infrastructure.Repositories.Common;
using IMS.Infrastructure.Services;
using IMS.Infrastructure.Services.Companies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 🔹 ADD THIS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Add services to the container.
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IMS.Application.Interfaces.Common.ICurrentUserService, IMS.API.Services.Common.CurrentUserService>();

// Register DbContext with ability to inject current user service via DI
builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Register Generic Repository
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddSingleton<IAuthorizationHandler, PermissionHandler>();

// Register Services
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IBranchService, BranchService>();
// Geography
builder.Services.AddScoped<IMS.Application.Interfaces.Geography.IGeographyService, IMS.Infrastructure.Services.Geography.GeographyService>();
// Warehouse services
builder.Services.AddScoped<IMS.Application.Interfaces.Warehouses.IWarehouseService, IMS.Infrastructure.Services.Warehouses.WarehouseService>();
// Stock services
builder.Services.AddScoped<IMS.Application.Interfaces.Warehouses.IStockService, IMS.Infrastructure.Services.Warehouses.StockService>();
// Stock transaction services
builder.Services.AddScoped<IMS.Application.Interfaces.Warehouses.IStockTransactionService, IMS.Infrastructure.Services.Warehouses.StockTransactionService>();
// Purchase order & GRN services
builder.Services.AddScoped<IMS.Application.Interfaces.Warehouses.IPurchaseOrderService, IMS.Infrastructure.Services.Warehouses.PurchaseOrderService>();
builder.Services.AddScoped<IMS.Application.Managers.Warehouses.IPurchaseOrderManager, IMS.Application.Managers.Warehouses.PurchaseOrderManager>();
// User services
builder.Services.AddScoped<IMS.Application.Interfaces.Security.IUserService, IMS.Infrastructure.Services.Security.UserService>();
// Role services
builder.Services.AddScoped<IMS.Application.Interfaces.Security.IRoleService, IMS.Infrastructure.Services.Security.RoleService>();
// Permission services
builder.Services.AddScoped<IMS.Application.Interfaces.Security.IPermissionService, IMS.Infrastructure.Services.Security.PermissionService>();
// RolePermission services
builder.Services.AddScoped<IMS.Application.Interfaces.Security.IRolePermissionService, IMS.Infrastructure.Services.Security.RolePermissionService>();
// Address service
builder.Services.AddScoped<IMS.Application.Interfaces.Common.IAddressService, IMS.Infrastructure.Services.Common.AddressService>();
// UserRole services
builder.Services.AddScoped<IMS.Application.Interfaces.Security.IUserRoleService, IMS.Infrastructure.Services.Security.UserRoleService>();

// Product & Pricing services (register these so managers can be constructed)
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IUnitOfMeasureService, IMS.Infrastructure.Services.Product.UnitOfMeasureService>();
builder.Services.AddScoped<IMS.Application.Interfaces.Pricing.IPriceListService, IMS.Infrastructure.Services.Pricing.PriceListService>();
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IItemPriceService, IMS.Infrastructure.Services.Product.ItemPriceService>();
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IItemService, IMS.Infrastructure.Services.Product.ItemService>();
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IItemImageService, IMS.Infrastructure.Services.Product.ItemImageService>();

// Register Managers (Separate managers for each entity)
builder.Services.AddScoped<ICompanyManager, CompanyManager>();
builder.Services.AddScoped<IBranchManager, BranchManager>();
// Geography manager
builder.Services.AddScoped<IMS.Application.Managers.Geography.IGeographyManager, IMS.Application.Managers.Geography.GeographyManager>();
// Warehouse manager
builder.Services.AddScoped<IMS.Application.Managers.Warehouses.IWarehouseManager, IMS.Application.Managers.Warehouses.WarehouseManager>();
// Stock manager
builder.Services.AddScoped<IMS.Application.Managers.Warehouses.IStockManager, IMS.Application.Managers.Warehouses.StockManager>();
// StockTransaction manager
builder.Services.AddScoped<IMS.Application.Managers.Warehouses.IStockTransactionManager, IMS.Application.Managers.Warehouses.StockTransactionManager>();
// GRN manager & service
builder.Services.AddScoped<IMS.Application.Interfaces.Warehouses.IGrnService, IMS.Infrastructure.Services.Warehouses.GrnService>();
builder.Services.AddScoped<IMS.Application.Managers.Warehouses.IGrnManager, IMS.Application.Managers.Warehouses.GrnManager>();
// Product managers
builder.Services.AddScoped<IMS.Application.Managers.Product.IUnitOfMeasureManager, IMS.Application.Managers.Product.UnitOfMeasureManager>();
// Pricing managers
builder.Services.AddScoped<IMS.Application.Managers.Pricing.IPriceListManager, IMS.Application.Managers.Pricing.PriceListManager>();
// ItemPrice manager
builder.Services.AddScoped<IMS.Application.Managers.Product.IItemPriceManager, IMS.Application.Managers.Product.ItemPriceManager>();
// Item manager
builder.Services.AddScoped<IMS.Application.Managers.Product.IItemManager, IMS.Application.Managers.Product.ItemManager>();
// ItemImage manager
builder.Services.AddScoped<IMS.Application.Managers.Product.IItemImageManager, IMS.Application.Managers.Product.ItemImageManager>();
builder.Services.AddScoped<IMS.Application.Managers.Security.IUserManager, IMS.Application.Managers.Security.UserManager>();
builder.Services.AddScoped<IMS.Application.Managers.Security.IRoleManager, IMS.Application.Managers.Security.RoleManager>();
builder.Services.AddScoped<IMS.Application.Managers.Security.IPermissionManager, IMS.Application.Managers.Security.PermissionManager>();
builder.Services.AddScoped<IMS.Application.Managers.Security.IUserRoleManager, IMS.Application.Managers.Security.UserRoleManager>();
builder.Services.AddScoped<IMS.Application.Managers.Security.IRolePermissionManager, IMS.Application.Managers.Security.RolePermissionManager>();
// Vendor service & manager
builder.Services.AddScoped<IMS.Application.Interfaces.Companies.IVendorService, IMS.Infrastructure.Services.Companies.VendorService>();
builder.Services.AddScoped<IMS.Application.Managers.Companies.IVendorManager, IMS.Application.Managers.Companies.VendorManager>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("IMS.Infrastructure")
    )
);


builder.Services.AddAuthorization(options =>
{
    foreach (var field in typeof(Permissions).GetFields())
    {
        var permission = field.GetValue(null)?.ToString();
        if (permission != null)
        {
            options.AddPolicy(permission, policy =>
                policy.Requirements.Add(new PermissionRequirement(permission)));
        }
    }
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtKey = builder.Configuration["JwtSettings:Key"];
if (!string.IsNullOrEmpty(jwtKey))
{
    builder.Services.AddAuthentication("Bearer")
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                ValidAudience = builder.Configuration["JwtSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey))
            };
        });
}
else
{
    // JwtSettings:Key missing - skip JWT setup to avoid startup failure. Inspect configuration.
    Console.WriteLine("Warning: JwtSettings:Key not configured. Skipping JWT authentication registration.");
}


var app = builder.Build();
//DbSeeder.Seed(app.Services.CreateScope().ServiceProvider.GetRequiredService<AppDbContext>());
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        DbSeeder.Seed(context);
    }
    catch (Exception ex)
    {
        // Log and continue so the app can start even if seeding fails.
        // Swagger was returning 500 due to unhandled exceptions during startup.
        Console.WriteLine("DbSeeder failed: " + ex);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🔹 ADD THIS (VERY IMPORTANT POSITION)
app.UseCors("AllowAngular");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();
