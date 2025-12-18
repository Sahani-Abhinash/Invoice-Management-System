## Companies Management Architecture - Repository Pattern

### Overview
The Companies management system now follows the **standard Repository Pattern** with clean separation of concerns and a manager layer for coordinated operations.

---

## Architecture Layers

### 1. **Repository Interface & Implementation** (IMS.Application/Infrastructure)

**IRepository<T>** - Generic interface:
```csharp
public interface IRepository<T> where T : class
{
    // Read Operations
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(Guid id);
    IQueryable<T> GetQueryable();

    // Write Operations
    Task AddAsync(T entity);
    Task AddRangeAsync(IEnumerable<T> entities);
    void Update(T entity);
    void UpdateRange(IEnumerable<T> entities);
    void Delete(T entity);
    void DeleteRange(IEnumerable<T> entities);
    Task<int> SaveChangesAsync();
}
```

**Repository<T>** - Generic implementation:
```
Repository<T> : IRepository<T>
?? Protected: _context (AppDbContext)
?? Protected: _dbSet (DbSet<T>)
?? Virtual methods for CRUD operations
```

### 2. **Service Interfaces** (IMS.Application/Interfaces/Companies)

```
ICompanyService
?? GetAllAsync()
?? GetByIdAsync(Guid id)
?? CreateAsync(CreateCompanyDto dto)
?? UpdateAsync(Guid id, CreateCompanyDto dto)
?? DeleteAsync(Guid id)

IBranchService
?? GetAllAsync()
?? GetByIdAsync(Guid id)
?? GetByCompanyIdAsync(Guid companyId) [Custom business logic]
?? CreateAsync(CreateBranchDto dto)
?? UpdateAsync(Guid id, CreateBranchDto dto)
?? DeleteAsync(Guid id)
```

### 3. **Service Implementations** (IMS.Infrastructure/Services/Companies)

```
CompanyService : ICompanyService
?? _repository: IRepository<Company>
?? Business logic (DTOs, validation, etc.)
?? Delegates to repository for data access

BranchService : IBranchService
?? _repository: IRepository<Branch>
?? _companyRepository: IRepository<Company>
?? Business logic (DTOs, validation, etc.)
?? Custom queries (GetByCompanyIdAsync)
?? Helper method: MapToDto()
```

### 4. **Manager Pattern** (IMS.Application/Managers/Companies)

```
ICompaniesManager
?? Company Operations
?  ?? GetAllCompaniesAsync()
?  ?? GetCompanyByIdAsync(Guid id)
?  ?? CreateCompanyAsync(CreateCompanyDto dto)
?  ?? UpdateCompanyAsync(Guid id, CreateCompanyDto dto)
?  ?? DeleteCompanyAsync(Guid id)
?
?? Branch Operations
   ?? GetAllBranchesAsync()
   ?? GetBranchByIdAsync(Guid id)
   ?? GetBranchesByCompanyAsync(Guid companyId)
   ?? CreateBranchAsync(CreateBranchDto dto)
   ?? UpdateBranchAsync(Guid id, CreateBranchDto dto)
   ?? DeleteBranchAsync(Guid id)

CompaniesManager : ICompaniesManager
?? _companyService: ICompanyService
?? _branchService: IBranchService
?? Delegates to services (Facade pattern)
```

### 5. **Unified Controller** (IMS.API/Controllers)

```
CompaniesController
?? _companiesManager: ICompaniesManager
?? Company Endpoints
?? Branch Endpoints
?? Minimal logic (just delegation & HTTP response)
```

---

## Data Flow

```
Controller ? Manager ? Service ? Repository ? DbContext ? Database
                                ?
                              DTO ? Entity Mapping
```

Example: `GET /api/companies/companies/123`
```
1. CompaniesController.GetCompanyById(id)
2. ICompaniesManager.GetCompanyByIdAsync(id)
3. ICompanyService.GetByIdAsync(id)
4. IRepository<Company>.GetByIdAsync(id)
5. DbSet<Company>.FindAsync(id)
6. Map Company ? CompanyDto
7. Return CompanyDto to Controller
8. Controller returns 200 OK with JSON
```

---

## Dependency Injection Registration

```csharp
// Register Generic Repository
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Register Services
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IBranchService, BranchService>();

// Register Manager
builder.Services.AddScoped<ICompaniesManager, CompaniesManager>();
```

---

## Benefits of Repository Pattern

? **Abstraction** - Data access logic is encapsulated
? **Testability** - Easy to mock repositories for unit testing
? **Reusability** - Generic repository works with any entity
? **Maintainability** - Changes to data access logic in one place
? **Flexibility** - Can switch database implementations
? **SOLID Principles** - Follows Single Responsibility & Dependency Inversion
? **Industry Standard** - Widely used in enterprise applications

---

## File Structure

```
IMS.Application/
??? Interfaces/
?   ??? Common/
?   ?   ??? IRepository.cs
?   ??? Companies/
?       ??? ICompanyService.cs
?       ??? IBranchService.cs
??? Managers/
?   ??? Companies/
?       ??? ICompaniesManager.cs
?       ??? CompaniesManager.cs
??? DTOs/
    ??? Companies/
        ??? CompanyDto.cs
        ??? CreateCompanyDto.cs
        ??? BranchDto.cs
        ??? CreateBranchDto.cs

IMS.Infrastructure/
??? Repositories/
?   ??? Common/
?       ??? Repository.cs
??? Services/
?   ??? Companies/
?       ??? CompanyService.cs
?       ??? BranchService.cs
??? Persistence/
    ??? Configurations/
        ??? Companies/
            ??? CompanyConfiguration.cs
            ??? BranchConfiguration.cs

IMS.API/
??? Controllers/
    ??? CompaniesController.cs (Unified)
```

---

## How to Add a New Entity

To add a new entity (e.g., `Warehouse`), follow these steps:

### 1. Create Domain Entity
```csharp
public class Warehouse : BaseEntity
{
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
}
```

### 2. Create DTOs
```csharp
public class WarehouseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public BranchDto Branch { get; set; } = null!;
}

public class CreateWarehouseDto
{
    public Guid BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
}
```

### 3. Create Service Interface
```csharp
public interface IWarehouseService
{
    Task<IEnumerable<WarehouseDto>> GetAllAsync();
    Task<WarehouseDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<WarehouseDto>> GetByBranchIdAsync(Guid branchId);
    Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto);
    Task<WarehouseDto?> UpdateAsync(Guid id, CreateWarehouseDto dto);
    Task<bool> DeleteAsync(Guid id);
}
```

### 4. Create Service Implementation
```csharp
public class WarehouseService : IWarehouseService
{
    private readonly IRepository<Warehouse> _repository;
    private readonly IRepository<Branch> _branchRepository;

    public WarehouseService(
        IRepository<Warehouse> repository,
        IRepository<Branch> branchRepository)
    {
        _repository = repository;
        _branchRepository = branchRepository;
    }

    // Implement all interface methods...
}
```

### 5. Register in Program.cs
```csharp
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
```

### 6. Add to Manager (or create new manager)
```csharp
public interface ICompaniesManager
{
    // Existing methods...
    Task<IEnumerable<WarehouseDto>> GetAllWarehousesAsync();
    // ... other warehouse operations
}
```

### 7. Add Endpoints to Controller
```csharp
[HttpGet("warehouses")]
public async Task<IActionResult> GetAllWarehouses()
{
    var warehouses = await _companiesManager.GetAllWarehousesAsync();
    return Ok(warehouses);
}
```

---

## Key Points

- **Services** contain business logic and use repositories for data access
- **Repositories** provide abstraction over the database
- **Manager** acts as a facade, coordinating multiple services
- **Controllers** are thin, delegating to managers
- **DTOs** provide a contract for API responses (not exposing entities directly)
- **Generic Repository** eliminates code duplication across different entities

---

## Testing Benefits

With this architecture, testing becomes straightforward:

```csharp
// Mock repository
var mockRepository = new Mock<IRepository<Company>>();
mockRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
    .ReturnsAsync(new Company { Id = Guid.NewGuid(), Name = "Test" });

// Create service with mocked repository
var service = new CompanyService(mockRepository.Object);

// Test service logic
var result = await service.GetByIdAsync(Guid.NewGuid());
Assert.NotNull(result);

