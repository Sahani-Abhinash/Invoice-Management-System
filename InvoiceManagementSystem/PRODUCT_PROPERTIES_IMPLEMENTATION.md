# Product Properties & Attributes Implementation

## Overview
This implementation adds a Master system for managing Product Properties (like Color, Size, Material, Brand) and their Attributes (like Color: Red, Green, Blue; Size: S, M, L, XL).

## Backend Implementation

### 1. Domain Entities

#### ProductProperty Entity
- **Location**: `IMS.Domain/Entities/Product/ProductProperty.cs`
- **Properties**:
  - `Id` (Guid) - Primary key
  - `Name` (string) - Property name (e.g., "Color", "Size")
  - `Description` (string?) - Optional description
  - `DisplayOrder` (int) - For ordering in UI
  - Navigation property to `Attributes` collection

#### PropertyAttribute Entity
- **Location**: `IMS.Domain/Entities/Product/PropertyAttribute.cs`
- **Properties**:
  - `Id` (Guid) - Primary key
  - `ProductPropertyId` (Guid) - Foreign key to ProductProperty
  - `Value` (string) - Attribute value (e.g., "Red", "Large")
  - `Description` (string?) - Optional description
  - `DisplayOrder` (int) - For ordering in UI
  - `Metadata` (string?) - Optional JSON or additional data (e.g., color codes)

### 2. DTOs

#### Product Property DTOs
- **Location**: `IMS.Application/DTOs/Product/ProductPropertyDto.cs`
- DTOs:
  - `ProductPropertyDto` - For returning property data
  - `CreateProductPropertyDto` - For creating/updating properties

#### Property Attribute DTOs
- **Location**: `IMS.Application/DTOs/Product/PropertyAttributeDto.cs`
- DTOs:
  - `PropertyAttributeDto` - For returning attribute data with property name
  - `CreatePropertyAttributeDto` - For creating/updating attributes

### 3. Services

#### ProductPropertyService
- **Location**: `IMS.Infrastructure/Services/Product/ProductPropertyService.cs`
- **Interface**: `IMS.Application/Interfaces/Product/IProductPropertyService.cs`
- Methods:
  - `GetAllAsync()` - Get all properties
  - `GetByIdAsync(id)` - Get property by ID
  - `CreateAsync(dto)` - Create new property
  - `UpdateAsync(id, dto)` - Update existing property
  - `DeleteAsync(id)` - Soft delete property

#### PropertyAttributeService
- **Location**: `IMS.Infrastructure/Services/Product/PropertyAttributeService.cs`
- **Interface**: `IMS.Application/Interfaces/Product/IPropertyAttributeService.cs`
- Methods:
  - `GetAllAsync()` - Get all attributes
  - `GetByPropertyIdAsync(propertyId)` - Get attributes for a specific property
  - `GetByIdAsync(id)` - Get attribute by ID
  - `CreateAsync(dto)` - Create new attribute
  - `UpdateAsync(id, dto)` - Update existing attribute
  - `DeleteAsync(id)` - Soft delete attribute

### 4. Managers

#### ProductPropertyManager
- **Location**: `IMS.Application/Managers/Product/ProductPropertyManager.cs`
- **Interface**: `IMS.Application/Managers/Product/IProductPropertyManager.cs`
- Delegates to ProductPropertyService

#### PropertyAttributeManager
- **Location**: `IMS.Application/Managers/Product/PropertyAttributeManager.cs`
- **Interface**: `IMS.Application/Managers/Product/IPropertyAttributeManager.cs`
- Delegates to PropertyAttributeService

### 5. Controllers

#### ProductPropertyController
- **Location**: `IMS.API/Controllers/ProductPropertyController.cs`
- **Route**: `/api/productproperty`
- Endpoints:
  - `GET /api/productproperty` - Get all properties
  - `GET /api/productproperty/{id}` - Get property by ID
  - `POST /api/productproperty` - Create property
  - `PUT /api/productproperty/{id}` - Update property
  - `DELETE /api/productproperty/{id}` - Delete property

#### PropertyAttributeController
- **Location**: `IMS.API/Controllers/PropertyAttributeController.cs`
- **Route**: `/api/propertyattribute`
- Endpoints:
  - `GET /api/propertyattribute` - Get all attributes
  - `GET /api/propertyattribute/property/{propertyId}` - Get attributes by property
  - `GET /api/propertyattribute/{id}` - Get attribute by ID
  - `POST /api/propertyattribute` - Create attribute
  - `PUT /api/propertyattribute/{id}` - Update attribute
  - `DELETE /api/propertyattribute/{id}` - Delete attribute

### 6. Database Configuration

#### Entity Configurations
- **ProductPropertyConfiguration**: `IMS.Infrastructure/Persistence/Configurations/Products/ProductPropertyConfiguration.cs`
  - Table: `ProductProperties`
  - Indexes on `Name`
  - Cascade delete for attributes

- **PropertyAttributeConfiguration**: `IMS.Infrastructure/Persistence/Configurations/Products/PropertyAttributeConfiguration.cs`
  - Table: `PropertyAttributes`
  - Indexes on `ProductPropertyId` and combined `(ProductPropertyId, Value)`
  - Foreign key to ProductProperty with cascade delete

#### DbContext Updates
- Added `DbSet<ProductProperty>` and `DbSet<PropertyAttribute>` in AppDbContext
- Entity configurations are auto-applied via `ApplyConfigurationsFromAssembly`

## Frontend Implementation

### 1. Models
- **Location**: `ims.ClientApp/src/app/models/product-property.model.ts`
- Interfaces for ProductProperty, PropertyAttribute, and their Create DTOs

### 2. Services

#### ProductPropertyService
- **Location**: `ims.ClientApp/src/app/product/product-property/product-property.service.ts`
- Handles API calls for product properties
- Maps response data to camelCase

#### PropertyAttributeService
- **Location**: `ims.ClientApp/src/app/product/property-attribute/property-attribute.service.ts`
- Handles API calls for property attributes
- Supports filtering by property ID

### 3. Components

#### Product Property Components
- **List Component**: `product-property-list`
  - Location: `ims.ClientApp/src/app/product/product-property/product-property-list/`
  - Features:
    - Display all properties in a table
    - Create, edit, delete operations
    - View attributes for each property
    - Ordered by DisplayOrder

- **Form Component**: `product-property-form`
  - Location: `ims.ClientApp/src/app/product/product-property/product-property-form/`
  - Features:
    - Create/Edit property
    - Form validation
    - Name, Description, DisplayOrder fields

#### Property Attribute Components
- **List Component**: `property-attribute-list`
  - Location: `ims.ClientApp/src/app/product/property-attribute/property-attribute-list/`
  - Features:
    - Display all attributes or filter by property
    - Create, edit, delete operations
    - Shows property name for each attribute
    - Ordered by DisplayOrder

- **Form Component**: `property-attribute-form`
  - Location: `ims.ClientApp/src/app/product/property-attribute/property-attribute-form/`
  - Features:
    - Create/Edit attribute
    - Select parent property from dropdown
    - Value, Description, DisplayOrder, Metadata fields
    - Pre-selects property when navigating from property list

### 4. Routes
Updated `ims.ClientApp/src/app/product/product.routes.ts` with:
- `/product/properties` - List properties
- `/product/properties/create` - Create property
- `/product/properties/edit/:id` - Edit property
- `/product/attributes` - List attributes
- `/product/attributes/create` - Create attribute
- `/product/attributes/edit/:id` - Edit attribute

## Database Migration

To create and apply the database migration:

```powershell
# Navigate to the project directory
cd "D:\Projects\Invoice Management System\InvoiceManagementSystem"

# Add migration
dotnet ef migrations add AddProductProperties --project IMS.Infrastructure --startup-project IMS.API

# Apply migration
dotnet ef database update --project IMS.Infrastructure --startup-project IMS.API
```

## Dependency Injection

All services, managers, and configurations are registered in `IMS.API/Program.cs`:
- Services: `IProductPropertyService`, `IPropertyAttributeService`
- Managers: `IProductPropertyManager`, `IPropertyAttributeManager`
- Generic Repository pattern is used (no custom repositories needed)

## Usage Examples

### Example 1: Create a Color Property with Attributes

1. **Create Property**:
   - Name: "Color"
   - Description: "Product color options"
   - DisplayOrder: 1

2. **Create Attributes**:
   - Value: "Red", Metadata: "#FF0000", DisplayOrder: 1
   - Value: "Green", Metadata: "#00FF00", DisplayOrder: 2
   - Value: "Blue", Metadata: "#0000FF", DisplayOrder: 3

### Example 2: Create a Size Property with Attributes

1. **Create Property**:
   - Name: "Size"
   - Description: "Product size options"
   - DisplayOrder: 2

2. **Create Attributes**:
   - Value: "Small", DisplayOrder: 1
   - Value: "Medium", DisplayOrder: 2
   - Value: "Large", DisplayOrder: 3
   - Value: "X-Large", DisplayOrder: 4

## Features

✅ Full CRUD operations for Properties and Attributes
✅ Cascade delete (deleting a property deletes its attributes)
✅ Display ordering for both properties and attributes
✅ Metadata field for additional data (color codes, JSON, etc.)
✅ Filter attributes by property
✅ Soft delete support via BaseEntity
✅ Audit fields (CreatedBy, UpdatedBy, etc.)
✅ Responsive Angular UI with Bootstrap
✅ Form validation on both frontend and backend
✅ Clean Architecture pattern
✅ Repository pattern with generic repository

## Future Enhancements

Potential improvements:
- Link properties/attributes to products (many-to-many relationship)
- Bulk import/export of properties and attributes
- Property grouping or categorization
- Image support for attribute values
- Multi-language support for property/attribute names
- Property templates for common use cases

## Testing

Navigate to:
- http://localhost:4200/product/properties - To manage properties
- http://localhost:4200/product/attributes - To manage attributes

API endpoints are available at:
- http://localhost:5000/api/productproperty
- http://localhost:5000/api/propertyattribute
