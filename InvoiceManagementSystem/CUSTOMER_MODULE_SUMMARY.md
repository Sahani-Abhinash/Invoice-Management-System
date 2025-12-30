# Customer Module Implementation Summary

## Overview
A complete Customer module has been successfully added to the Invoice Management System, enabling the management of customers in the system.

## Files Created

### 1. Domain Layer
- **IMS.Domain\Entities\Companies\Customer.cs**
  - Domain entity for Customer
  - Properties: Id, Name, ContactName, Email, Phone, TaxNumber, BranchId
  - Navigation property to Branch entity
  - Extends BaseEntity for audit fields

### 2. Application Layer - DTOs
- **IMS.Application\DTOs\Companies\CreateCustomerDto.cs**
  - DTO for creating/updating customers
  - Contains all customer properties except Id

- **IMS.Application\DTOs\Companies\CustomerDto.cs**
  - DTO for returning customer data
  - Includes customer properties and optional Branch information

### 3. Application Layer - Interfaces
- **IMS.Application\Interfaces\Companies\ICustomerService.cs**
  - Service interface with methods:
    - GetAllAsync()
    - GetByIdAsync(id)
    - GetByBranchIdAsync(branchId)
    - CreateAsync(dto)
    - UpdateAsync(id, dto)
    - DeleteAsync(id)

- **IMS.Application\Managers\Companies\ICustomerManager.cs**
  - Manager interface (same methods as ICustomerService)

### 4. Infrastructure Layer - Services
- **IMS.Infrastructure\Services\Companies\CustomerService.cs**
  - Implements ICustomerService
  - Handles database operations
  - Maps Customer entities to CustomerDto
  - Supports filtering by branch

### 5. Application Layer - Managers
- **IMS.Application\Managers\Companies\CustomerManager.cs**
  - Implements ICustomerManager
  - Delegates to CustomerService
  - Provides business logic coordination

### 6. API Layer
- **IMS.API\Controllers\CustomerController.cs**
  - REST API endpoints:
    - `GET /api/customer` - Get all customers
    - `GET /api/customer/{id}` - Get customer by ID
    - `GET /api/customer/branch/{branchId}` - Get customers for a branch
    - `POST /api/customer` - Create customer
    - `PUT /api/customer/{id}` - Update customer
    - `DELETE /api/customer/{id}` - Delete customer (soft-delete)

### 7. Configuration
- **IMS.API\Program.cs** (Updated)
  - Registered ICustomerService ? CustomerService
  - Registered ICustomerManager ? CustomerManager

- **IMS.Infrastructure\Persistence\AppDbContext.cs** (Updated)
  - Added DbSet<Customer> Customers

### 8. Database Migration
- **IMS.Infrastructure\Migrations\20251226000208_AddedCustomer.cs**
  - Creates Customers table with:
    - Id (PK, uniqueidentifier)
    - Name, ContactName, Email, Phone, TaxNumber (nvarchar)
    - BranchId (FK to Branches, nullable)
    - Audit fields (CreatedBy, CreatedAt, UpdatedBy, UpdatedAt, DeletedBy, DeletedAt)
    - Soft-delete fields (IsActive, IsDeleted)
    - RowVersion (concurrency token)
  - Creates index on BranchId for query performance

- **IMS.Infrastructure\Migrations\20251226000208_AddedCustomer.Designer.cs**
  - EF Core migration designer file

## Architecture Patterns Followed

1. **Layered Architecture**: Separation of concerns across Domain, Application, Infrastructure, and API layers
2. **Dependency Injection**: All services registered in DI container
3. **Repository Pattern**: Uses generic IRepository<T> for data access
4. **DTO Pattern**: Separate DTOs for input (CreateCustomerDto) and output (CustomerDto)
5. **Manager Pattern**: Business logic coordination through manager classes
6. **Soft Delete**: Customers are soft-deleted (IsDeleted = true)
7. **Audit Trail**: Automatic tracking of CreatedBy, UpdatedBy, DeletedBy timestamps
8. **Navigation Properties**: Customer can be associated with a Branch
9. **REST API**: Standard RESTful API conventions

## How to Apply the Migration

Run the following command to apply the migration to the database:

```bash
dotnet ef database update -p IMS.Infrastructure -s IMS.API
```

Or manually:
```bash
cd D:\Projects\Invoice Management System\InvoiceManagementSystem
dotnet ef database update -p IMS.Infrastructure -s IMS.API
```

## Usage Example

### Create a Customer
```http
POST /api/customer
Content-Type: application/json

{
    "name": "ABC Corporation",
    "contactName": "John Doe",
    "email": "john@abc.com",
    "phone": "+1234567890",
    "taxNumber": "TAX123456",
    "branchId": "guid-here"
}
```

### Get All Customers
```http
GET /api/customer
```

### Get Customer by ID
```http
GET /api/customer/{id}
```

### Get Customers for a Branch
```http
GET /api/customer/branch/{branchId}
```

### Update a Customer
```http
PUT /api/customer/{id}
Content-Type: application/json

{
    "name": "Updated Name",
    "contactName": "Jane Doe",
    "email": "jane@abc.com",
    "phone": "+9876543210",
    "taxNumber": "TAX654321",
    "branchId": "guid-here"
}
```

### Delete a Customer (Soft-Delete)
```http
DELETE /api/customer/{id}
```

## Integration with Invoice Module

The Customer entity is already referenced in the Invoice entity (CustomerId field), so customers can now be used when creating invoices.

## Next Steps

1. Apply the migration to your database
2. Test the API endpoints
3. Optionally add customer-related permissions and authorization rules
4. Add customer-related business logic as needed
5. Integrate with the Invoice creation workflow
