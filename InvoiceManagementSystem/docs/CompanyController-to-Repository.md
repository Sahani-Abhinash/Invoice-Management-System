Layered Flow: `CompanyController` -> `ICompanyManager` -> `CompanyManager` -> `ICompanyService` -> `CompanyService` -> `IRepository` -> `Repository`

This document explains why this layered architecture exists, how the layers interact, and a real-time issue you may encounter in production (concurrent duplicate creation). It includes practical recommendations and minimal code examples you can apply in the existing solution.

## Why use these layers?
- Separation of concerns: each layer has one responsibility (HTTP concerns, orchestration, domain rules, persistence).
- Testability: interfaces such as `ICompanyManager`, `ICompanyService`, and `IRepository<T>` make it easy to mock dependencies in unit tests.
- Reuse: business logic lives in services/managers and can be reused by other entry points (background services, CLI, other controllers).
- Maintainability: small focused classes are easier to change and reason about.

## Responsibilities (short)
- `CompanyController` (API): translate HTTP requests/responses, call manager. Keep it thin.
- `ICompanyManager` / `CompanyManager`: application-level orchestration, DTO mapping, validation, transaction boundaries across services when needed.
- `ICompanyService` / `CompanyService`: domain/business rules specific to companies, coordinates repository for persistence.
- `IRepository<T>` / `Repository<T>`: generic data access (EF Core `DbContext` usage). Exposes `GetAllAsync`, `GetByIdAsync`, `GetQueryable`, `Add/Update/Delete`, and `SaveChangesAsync`.

## Example: create a company (POST /api/companies)
1. `CompanyController.Post(CreateCompanyDto dto)` receives request and calls `ICompanyManager.CreateAsync(dto)`.
2. `CompanyManager.CreateAsync(dto)` validates input, maps the DTO to `Company` entity and calls `ICompanyService.CreateCompanyAsync(company)`.
3. `CompanyService.CreateCompanyAsync(company)` enforces domain rules (e.g., unique `TaxNumber`) and calls repository:
   - `_companyRepository.AddAsync(company)`
   - `_company_repository.SaveChangesAsync()`
4. `Repository<T>` uses `DbContext.Set<T>()` and `DbContext.SaveChangesAsync()` to persist the entity to the database.
5. Result flows back up to the controller which returns HTTP 201 with the created resource.

## Real-time production issue: concurrent duplicate company creation

Scenario:
- Two clients concurrently POST the same company with identical `TaxNumber`.
- `CompanyService` checks uniqueness by querying `GetQueryable().AnyAsync(c => c.TaxNumber == taxNumber)`.
- Both requests see "no existing company" (race window), both call `AddAsync` and then `SaveChangesAsync` and both succeed — resulting in duplicate rows.

Root causes:
- Lack of a strict database uniqueness constraint on `TaxNumber`.
- Checking for existence in application code only (read -> decide -> write) introduces a race condition.

Recommended solutions (choose the simplest that fits your environment):

1) Enforce uniqueness at the database level (recommended)

   - Add a unique index on `TaxNumber` using EF Fluent API or a migration:

   ```csharp
   // In AppDbContext.OnModelCreating
   modelBuilder.Entity<Company>()
       .HasIndex(c => c.TaxNumber)
       .IsUnique();
   ```

   - This guarantees the database will reject duplicates regardless of concurrent requests.

2) Handle unique constraint violations in `CompanyService`

   - Catch `DbUpdateException` (or provider-specific exception) when `SaveChangesAsync` fails and translate to a meaningful error response.

   ```csharp
   public async Task<Company> CreateCompanyAsync(Company company)
   {
       try
       {
           await _companyRepository.AddAsync(company);
           await _companyRepository.SaveChangesAsync();
           return company;
       }
       catch (DbUpdateException ex)
       {
           // inspect inner exception / SQL error code to confirm unique constraint violation
           throw new DuplicateEntityException("A company with the same TaxNumber already exists.");
       }
   }
   ```

3) Add transactional / locking strategies (more complex)

   - Use pessimistic locking (SELECT ... FOR UPDATE) when your DB and EF provider support it — not typical for simple CRUD APIs.
   - Use serializable transaction isolation level to avoid phantom reads — reduces concurrency and must be applied carefully.

4) Use idempotency keys or client-generated deterministic IDs

   - If client includes a unique request id or deterministic business key, you can make POST idempotent and detect duplicate intent.

## Where to implement checks and responses
- Keep existence checks in `CompanyService` (domain rules) but rely on the DB for strict guarantees.
- `CompanyManager` should translate service exceptions into user-facing error DTOs or HTTP codes (e.g., 409 Conflict for duplicates).

## Dependency Injection (example registration)

Register these implementations in startup so DI constructs the chain:

```csharp
services.AddScoped<ICompanyManager, CompanyManager>();
services.AddScoped<ICompanyService, CompanyService>();
services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
```

This results in: `CompanyController` -> `CompanyManager` -> `CompanyService` -> `Repository<Company>` -> `AppDbContext`.

## Quick checklist to fix duplicate-creation race
1. Add unique index on `Company.TaxNumber` in `AppDbContext.OnModelCreating` and create a migration.
2. In `CompanyService.CreateCompanyAsync`, optionally perform a read-check for a nicer error message, but do not rely on it for correctness.
3. Catch `DbUpdateException` in `CompanyService` and throw a domain-specific exception (`DuplicateEntityException`).
4. In `CompanyManager`, map domain exceptions to application-friendly error results (e.g., 409 Conflict).

## Summary
- Layered architecture isolates concerns, improves testability, and makes the call flow clear.
- However, application-level existence checks alone are vulnerable to races under concurrency — the database must be the source of truth for uniqueness.
- Use DB constraints + graceful exception handling in the service layer to provide safe and user-friendly behavior.

If you want, I can also:
- add the `HasIndex(...).IsUnique()` change to `AppDbContext` and create a migration scaffold (requires running migrations locally), or
- provide a small sample `CompanyService.CreateCompanyAsync` implementation and `CompanyManager` mapping for your project files.

---
Document generated by GitHub Copilot
