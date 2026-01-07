# Item Property Assignment - Quick Start Guide

## What Was Implemented

A complete system to assign Product Properties and their Attribute Values to Items. This allows items to be tagged with characteristics like:
- **Color**: Red, Blue, Green
- **Size**: Small, Medium, Large
- **Material**: Cotton, Polyester, Wool
- **Condition**: New, Refurbished, Used

## Getting Started (For Users)

### 1. Access Item Management
Navigate to **Products → Items** in the left menu.

### 2. Create or Edit an Item
- Click "Add Item" to create new or click an existing item to edit
- Fill in: Name, SKU, Unit of Measure
- Click "Save Item" (required before assigning properties)

### 3. Assign Properties
After saving, you'll see the **"Property Assignments"** card below the item form:

**Step 1: Select a Property**
- Open the Property dropdown
- Choose from available properties (Color, Size, etc.)

**Step 2: Select a Value**
- The Value dropdown automatically populates with options for the selected property
- Choose the specific value (e.g., "Red" for Color)

**Step 3: Add Notes (Optional)**
- Enter any relevant notes about this assignment
- Example: "Premium quality fabric"

**Step 4: Assign**
- Click "Assign Property" button
- The property will be added to the list below

### 4. Manage Assignments
- View all assigned properties in the table
- Click the trash icon to remove any assignment
- Confirm deletion when prompted

## Getting Started (For Developers)

### Backend Setup

**1. Database Migration (Required)**
```bash
cd "d:\Projects\Invoice Management System\InvoiceManagementSystem"

# Create migration
dotnet ef migrations add AddItemPropertyAttributeEntity `
  --project IMS.Infrastructure `
  --startup-project IMS.API

# Apply to database
dotnet ef database update `
  --project IMS.Infrastructure `
  --startup-project IMS.API
```

**2. Verify Services are Registered**
Check `IMS.API/Program.cs` - should contain:
```csharp
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IItemPropertyAttributeService, 
    IMS.Infrastructure.Services.Product.ItemPropertyAttributeService>();

builder.Services.AddScoped<IMS.Application.Managers.Product.IItemPropertyAttributeManager, 
    IMS.Application.Managers.Product.ItemPropertyAttributeManager>();
```

### Frontend Setup

**1. Verify Imports**
File: `ims.ClientApp/src/app/product/items/item-form/item-form.component.ts`
- Should import `ItemPropertyAssignmentComponent`
- Component should be in imports array

**2. Start Angular Dev Server**
```bash
cd "d:\Projects\Invoice Management System\InvoiceManagementSystem\ims.ClientApp"
npm start
```

### Testing the Feature

**1. Test via UI**
- Start the app (both backend and frontend)
- Create an item
- Assign a property through the UI
- Verify it appears in the list

**2. Test via API (Postman/Thunder Client)**

Create assignment:
```
POST http://localhost:5000/api/itempropertyattribute
Content-Type: application/json

{
  "itemId": "YOUR-ITEM-ID",
  "propertyAttributeId": "YOUR-ATTRIBUTE-ID",
  "notes": "Test assignment",
  "displayOrder": 0
}
```

Get item assignments:
```
GET http://localhost:5000/api/itempropertyattribute/item/YOUR-ITEM-ID
```

Delete assignment:
```
DELETE http://localhost:5000/api/itempropertyattribute/ASSIGNMENT-ID
```

## File Structure Overview

### Backend
```
IMS.Domain/Entities/Product/
├── ItemPropertyAttribute.cs (NEW - Entity)
├── Item.cs (UPDATED - Added navigation property)
└── PropertyAttribute.cs (UPDATED - Added navigation property)

IMS.Application/
├── DTOs/Product/ItemPropertyAttributeDto.cs (NEW)
├── Interfaces/Product/IItemPropertyAttributeService.cs (NEW)
└── Managers/Product/
    ├── IItemPropertyAttributeManager.cs (NEW)
    └── ItemPropertyAttributeManager.cs (NEW)

IMS.Infrastructure/
├── Services/Product/ItemPropertyAttributeService.cs (NEW)
└── Persistence/Configurations/Products/ItemPropertyAttributeConfiguration.cs (NEW)

IMS.API/
└── Controllers/ItemPropertyAttributeController.cs (NEW)
```

### Frontend
```
ims.ClientApp/src/app/product/
├── item-property-attribute/ (NEW)
│   └── item-property-attribute.service.ts
├── item-property-assignment/ (NEW)
│   ├── item-property-assignment.component.ts
│   ├── item-property-assignment.component.html
│   └── item-property-assignment.component.css
├── items/item-form/ (UPDATED)
│   ├── item-form.component.ts
│   └── item-form.component.html
└── models/product-property.model.ts (UPDATED)
```

## Key Features Implemented

✅ **Backend**
- Domain entity with proper relationships
- Service layer with full CRUD operations
- Manager pattern for consistency
- API endpoints with filtering capabilities
- Database configuration with constraints and indexes
- Soft delete support
- Error handling and validation

✅ **Frontend**
- Angular standalone component
- Reactive forms with validation
- Cascading dropdown selects
- Property assignment and removal
- Loading and error states
- Bootstrap 5 styling
- Integrated into item form

✅ **Database**
- ItemPropertyAttributes table
- Unique constraint (no duplicate assignments)
- Performance indexes
- Audit fields (CreatedAt, UpdatedAt, etc.)
- Soft delete capability

## Common Tasks

### Assign a Property to an Item
1. Go to Products → Items
2. Click on an item to edit
3. Save the item first
4. In "Property Assignments" card, select property and value
5. Click "Assign Property"

### Remove an Assignment
1. In the "Property Assignments" card, find the assignment
2. Click the trash icon
3. Confirm deletion

### Get All Properties for an Item
**API:**
```
GET /api/itempropertyattribute/item/{itemId}
```

### Find All Items with Specific Property
**API:**
```
GET /api/itempropertyattribute/attribute/{propertyAttributeId}
```

## Troubleshooting

### Property Assignments card not showing
**Solution:** Make sure you save the item first. The component only displays in edit mode.

### Properties not loading in dropdown
**Solution:** Ensure properties exist in the database (Products → Properties menu)

### Cannot assign - get error
**Solution:** Check that:
1. Property exists in Products → Properties
2. Property Attribute exists in Products → Attributes
3. Item has been saved

### Migration errors
**Solution:** 
1. Back up database
2. Check SQL error log for details
3. Ensure EF Core tools are installed: `dotnet tool install --global dotnet-ef`

## Next Steps

### Potential Enhancements
1. Bulk assignment for multiple items
2. Property assignment templates
3. Search/filter items by assigned properties
4. Drag-to-reorder assignments
5. Variant generation from properties
6. Import assignments from CSV

### Related Features
- Product Properties → Manage property types
- Property Attributes → Manage property values
- Items → View and edit items with assigned properties

## Performance Notes

- Three database indexes created for optimal query performance
- Soft delete support maintains data integrity
- Service layer handles all business logic
- Angular component optimized with proper change detection

## Security

- All API endpoints validate input
- Database constraints prevent invalid data
- Soft delete for audit trail
- EF Core parameterized queries prevent SQL injection

## Support

For issues or questions:
1. Check browser console for Angular errors
2. Check API response in Network tab
3. Review [ITEM_PROPERTY_ASSIGNMENT_IMPLEMENTATION.md](ITEM_PROPERTY_ASSIGNMENT_IMPLEMENTATION.md) for detailed documentation
