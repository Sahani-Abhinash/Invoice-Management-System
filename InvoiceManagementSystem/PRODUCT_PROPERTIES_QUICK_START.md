# Product Properties & Attributes - Quick Start Guide

## What Was Implemented

A complete Master system for managing Product Properties (like Color, Size, Material) and their Attributes (like Red, Green, Blue for Color; S, M, L for Size).

## File Structure Created

### Backend (C#/.NET)

```
IMS.Domain/
├── Entities/Product/
│   ├── ProductProperty.cs          ✅ NEW
│   └── PropertyAttribute.cs        ✅ NEW

IMS.Application/
├── DTOs/Product/
│   ├── ProductPropertyDto.cs       ✅ NEW
│   └── PropertyAttributeDto.cs     ✅ NEW
├── Interfaces/Product/
│   ├── IProductPropertyService.cs  ✅ NEW
│   └── IPropertyAttributeService.cs ✅ NEW
├── Managers/Product/
│   ├── IProductPropertyManager.cs  ✅ NEW
│   ├── ProductPropertyManager.cs   ✅ NEW
│   ├── IPropertyAttributeManager.cs ✅ NEW
│   └── PropertyAttributeManager.cs  ✅ NEW

IMS.Infrastructure/
├── Services/Product/
│   ├── ProductPropertyService.cs   ✅ NEW
│   └── PropertyAttributeService.cs ✅ NEW
├── Persistence/
│   ├── AppDbContext.cs             ✅ UPDATED (added DbSets)
│   └── Configurations/Products/
│       ├── ProductPropertyConfiguration.cs    ✅ NEW
│       └── PropertyAttributeConfiguration.cs  ✅ NEW

IMS.API/
├── Controllers/
│   ├── ProductPropertyController.cs    ✅ NEW
│   └── PropertyAttributeController.cs  ✅ NEW
└── Program.cs                          ✅ UPDATED (DI registrations)
```

### Frontend (Angular)

```
ims.ClientApp/src/app/
├── models/
│   └── product-property.model.ts   ✅ NEW
├── product/
│   ├── product.routes.ts           ✅ UPDATED
│   ├── product-property/
│   │   ├── product-property.service.ts              ✅ NEW
│   │   ├── product-property-list/
│   │   │   ├── product-property-list.component.ts   ✅ NEW
│   │   │   ├── product-property-list.component.html ✅ NEW
│   │   │   └── product-property-list.component.css  ✅ NEW
│   │   └── product-property-form/
│   │       ├── product-property-form.component.ts   ✅ NEW
│   │       ├── product-property-form.component.html ✅ NEW
│   │       └── product-property-form.component.css  ✅ NEW
│   └── property-attribute/
│       ├── property-attribute.service.ts              ✅ NEW
│       ├── property-attribute-list/
│       │   ├── property-attribute-list.component.ts   ✅ NEW
│       │   ├── property-attribute-list.component.html ✅ NEW
│       │   └── property-attribute-list.component.css  ✅ NEW
│       └── property-attribute-form/
│           ├── property-attribute-form.component.ts   ✅ NEW
│           ├── property-attribute-form.component.html ✅ NEW
│           └── property-attribute-form.component.css  ✅ NEW
```

## Next Steps

### 1. Create Database Migration

Run this command in PowerShell from the project root:

```powershell
cd "D:\Projects\Invoice Management System\InvoiceManagementSystem"
dotnet ef migrations add AddProductPropertiesAndAttributes --project IMS.Infrastructure --startup-project IMS.API
```

### 2. Apply Migration to Database

```powershell
dotnet ef database update --project IMS.Infrastructure --startup-project IMS.API
```

### 3. Build and Run

```powershell
# Build the backend
dotnet build

# Run the API (in one terminal)
cd IMS.API
dotnet run

# Run the Angular app (in another terminal)
cd ims.ClientApp
npm start
```

### 4. Access the Features

Navigate to:
- **Product Properties**: http://localhost:4200/product/properties
- **Property Attributes**: http://localhost:4200/product/attributes

## API Endpoints

### Product Properties
- `GET /api/productproperty` - Get all properties
- `GET /api/productproperty/{id}` - Get property by ID
- `POST /api/productproperty` - Create property
- `PUT /api/productproperty/{id}` - Update property
- `DELETE /api/productproperty/{id}` - Delete property

### Property Attributes
- `GET /api/propertyattribute` - Get all attributes
- `GET /api/propertyattribute/property/{propertyId}` - Get attributes for a property
- `GET /api/propertyattribute/{id}` - Get attribute by ID
- `POST /api/propertyattribute` - Create attribute
- `PUT /api/propertyattribute/{id}` - Update attribute
- `DELETE /api/propertyattribute/{id}` - Delete attribute

## How to Use

### Example: Create Color Property

1. Navigate to http://localhost:4200/product/properties
2. Click "Add Property"
3. Fill in:
   - Name: `Color`
   - Description: `Product color options`
   - Display Order: `1`
4. Click "Create"
5. Back on the list, click "Attributes" button for Color
6. Click "Add Attribute"
7. Fill in:
   - Property: `Color` (auto-selected)
   - Value: `Red`
   - Metadata: `#FF0000`
   - Display Order: `1`
8. Repeat for other colors (Green, Blue, etc.)

### Example: Create Size Property

1. Navigate to http://localhost:4200/product/properties
2. Click "Add Property"
3. Fill in:
   - Name: `Size`
   - Description: `Product size options`
   - Display Order: `2`
4. Click "Create"
5. Add attributes: Small, Medium, Large, X-Large

## Features Implemented

✅ **Backend**
- Clean Architecture with Domain, Application, and Infrastructure layers
- Repository pattern using generic repository
- Service and Manager layers for business logic
- RESTful API with full CRUD operations
- Entity Framework Core with proper configurations
- Soft delete support
- Audit fields (CreatedBy, UpdatedBy, timestamps)
- Cascade delete (deleting property deletes its attributes)

✅ **Frontend**
- Angular standalone components
- Reactive forms with validation
- Bootstrap styling
- List and form components for both entities
- Filter attributes by property
- Navigation between related entities
- Error handling and loading states

✅ **Database**
- Two new tables: ProductProperties and PropertyAttributes
- Proper indexes for performance
- Foreign key constraints
- Cascade delete behavior

## Key Features

1. **Display Ordering**: Both properties and attributes have a DisplayOrder field to control their appearance order in the UI
2. **Metadata Field**: Attributes can store additional data (like color codes in hex format, JSON data, etc.)
3. **Filtering**: View all attributes or filter by a specific property
4. **Validation**: Both frontend and backend validation
5. **Responsive UI**: Bootstrap-based design works on all screen sizes

## Troubleshooting

If you encounter errors:

1. **Build errors**: Make sure all NuGet packages are restored
2. **Database errors**: Ensure the connection string in appsettings.json is correct
3. **Migration errors**: Delete the migration and try again
4. **Angular errors**: Run `npm install` in the ims.ClientApp folder

For detailed documentation, see: `PRODUCT_PROPERTIES_IMPLEMENTATION.md`
