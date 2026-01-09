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
// Consolidated registration: include migrations assembly and allow service-provider based configuration
builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("IMS.Infrastructure")
    );
});

// Register Generic Repository
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Register Currency Repository (kept for potential future use)
// Accounting module removed: rely on generic repository and simplified accounting service if present
builder.Services.AddScoped<IMS.Application.Interfaces.Accounting.ICurrencyRepository, IMS.Infrastructure.Repositories.Accounting.CurrencyRepository>();
builder.Services.AddScoped<IMS.Infrastructure.Services.Accounting.CurrencyService>();

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
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IProductPropertyService, IMS.Infrastructure.Services.Product.ProductPropertyService>();
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IPropertyAttributeService, IMS.Infrastructure.Services.Product.PropertyAttributeService>();
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IItemPropertyAttributeService, IMS.Infrastructure.Services.Product.ItemPropertyAttributeService>();

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
builder.Services.AddScoped<IMS.Application.Managers.Product.IProductPropertyManager, IMS.Application.Managers.Product.ProductPropertyManager>();
builder.Services.AddScoped<IMS.Application.Managers.Product.IPropertyAttributeManager, IMS.Application.Managers.Product.PropertyAttributeManager>();
builder.Services.AddScoped<IMS.Application.Managers.Product.IItemPropertyAttributeManager, IMS.Application.Managers.Product.ItemPropertyAttributeManager>();
// ItemPriceVariant service & manager
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IItemPriceVariantService, IMS.Infrastructure.Services.Product.ItemPriceVariantService>();
builder.Services.AddScoped<IMS.Application.Managers.Product.IItemPriceVariantManager, IMS.Application.Managers.Product.ItemPriceVariantManager>();
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
// Customer service & manager
builder.Services.AddScoped<IMS.Application.Interfaces.Companies.ICustomerService, IMS.Infrastructure.Services.Companies.CustomerService>();
builder.Services.AddScoped<IMS.Application.Managers.Companies.ICustomerManager, IMS.Application.Managers.Companies.CustomerManager>();
// Invoice service & manager
builder.Services.AddScoped<IMS.Application.Interfaces.Invoicing.IInvoiceService, IMS.Infrastructure.Services.Invoicing.InvoiceService>();
builder.Services.AddScoped<IMS.Application.Managers.Invoicing.IInvoiceManager, IMS.Application.Managers.Invoicing.InvoiceManager>();
// Payment service (uses IRepository<Payment> - no custom repository needed)
builder.Services.AddScoped<IMS.Application.Interfaces.Invoicing.IPaymentService, IMS.Infrastructure.Services.Invoicing.PaymentService>();
// Category service (for transaction categorization)
builder.Services.AddScoped<IMS.Application.Interfaces.Transaction.ICategoryService, IMS.Infrastructure.Services.Transaction.CategoryService>();
// Transaction service (simplified accounting - no custom repository needed)
builder.Services.AddScoped<IMS.Application.Interfaces.Transaction.ITransactionService, IMS.Infrastructure.Services.Transaction.TransactionService>();
// Accounting service removed from DI registrations (module trimmed). Use CurrencyService and generic repositories instead.

// Note: DbContext already registered above with migrations assembly.


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
        // Ensure database schema is up-to-date before seeding.
        // This applies any pending EF Core migrations (including the Category.Type column).
        context.Database.Migrate();
        DbSeeder.Seed(context);
    }
    catch (Exception ex)
    {
        // Log and continue so the app can start even if seeding fails.
        // Swagger was returning 500 due to unhandled exceptions during startup.
        Console.WriteLine("DbSeeder failed: " + ex);
    }
}

// Global exception logging middleware to capture unhandled exceptions and 500 responses
// This helps diagnose errors that occur while generating Swagger/OpenAPI documents.
app.Use(async (context, next) =>
{
    try
    {
        await next();

        if (context.Response.StatusCode >= 500)
        {
            Console.WriteLine($"Request {context.Request.Method} {context.Request.Path} returned status {context.Response.StatusCode}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Unhandled exception processing {context.Request.Method} {context.Request.Path}: {ex}");
        throw;
    }
});

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

// Enable serving static files from wwwroot (for uploaded logos, etc.)
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();
