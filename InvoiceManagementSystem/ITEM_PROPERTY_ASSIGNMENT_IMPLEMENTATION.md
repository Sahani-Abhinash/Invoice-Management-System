# Item Property/Attribute Assignment Implementation

## Overview
This document describes the implementation of assigning Product Properties and Property Attributes to Items. This feature enables items to be tagged with specific property values (e.g., assigning "Color: Red" and "Size: Large" to a specific product).

## Architecture

### Relationship Design
```
ProductProperty (Master) 
├── PropertyAttribute (Values)
│   └── ItemPropertyAttribute (Assignments)
└── Item (Products)
```

**ItemPropertyAttribute** creates a many-to-many relationship between Items and PropertyAttributes:
- An Item can have multiple PropertyAttributes
- A PropertyAttribute can be assigned to multiple Items
- Each assignment is tracked with optional notes and display order

### Database Design

**ItemPropertyAttribute Table**
```sql
CREATE TABLE ItemPropertyAttributes (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ItemId UNIQUEIDENTIFIER NOT NULL FK,
    PropertyAttributeId UNIQUEIDENTIFIER NOT NULL FK,
    Notes NVARCHAR(500),
    DisplayOrder INT DEFAULT 0,
    IsDeleted BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2,
    CreatedBy UNIQUEIDENTIFIER,
    UpdatedAt DATETIME2,
    UpdatedBy UNIQUEIDENTIFIER,
    DeletedAt DATETIME2,
    DeletedBy UNIQUEIDENTIFIER,
    RowVersion ROWVERSION
);

-- Unique constraint: one property attribute per item (no duplicates)
ALTER TABLE ItemPropertyAttributes 
ADD CONSTRAINT UK_ItemPropertyAttribute_ItemId_PropertyAttributeId 
UNIQUE (ItemId, PropertyAttributeId);

-- Indexes for common queries
CREATE INDEX IX_ItemPropertyAttribute_ItemId ON ItemPropertyAttributes(ItemId);
CREATE INDEX IX_ItemPropertyAttribute_PropertyAttributeId ON ItemPropertyAttributes(PropertyAttributeId);
CREATE INDEX IX_ItemPropertyAttribute_ItemId_DisplayOrder ON ItemPropertyAttributes(ItemId, DisplayOrder);
```

## Backend Implementation

### Domain Layer (IMS.Domain)

**Entity: ItemPropertyAttribute**
```csharp
public class ItemPropertyAttribute : BaseEntity
{
    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;
    
    public Guid PropertyAttributeId { get; set; }
    public PropertyAttribute PropertyAttribute { get; set; } = null!;
    
    public string? Notes { get; set; }
    public int DisplayOrder { get; set; } = 0;
}
```

**Navigation Properties Added**
- `Item.PropertyAttributes` - One-to-many relationship
- `PropertyAttribute.ItemPropertyAttributes` - One-to-many relationship

### Application Layer (IMS.Application)

**DTOs**
```csharp
public class ItemPropertyAttributeDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public Guid PropertyAttributeId { get; set; }
    public string? PropertyName { get; set; }           // For display
    public string? PropertyAttributeName { get; set; } // For display
    public string? AttributeValue { get; set; }        // For display
    public string? Notes { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreateItemPropertyAttributeDto
{
    public Guid ItemId { get; set; }
    public Guid PropertyAttributeId { get; set; }
    public string? Notes { get; set; }
    public int DisplayOrder { get; set; } = 0;
}

public class UpdateItemPropertyAttributeDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public Guid PropertyAttributeId { get; set; }
    public string? Notes { get; set; }
    public int DisplayOrder { get; set; }
}
```

**Service Interface: IItemPropertyAttributeService**
```csharp
Task<ItemPropertyAttributeDto> GetByIdAsync(Guid id);
Task<List<ItemPropertyAttributeDto>> GetAllAsync();
Task<List<ItemPropertyAttributeDto>> GetByItemIdAsync(Guid itemId);
Task<List<ItemPropertyAttributeDto>> GetByPropertyAttributeIdAsync(Guid propertyAttributeId);
Task<ItemPropertyAttributeDto> CreateAsync(CreateItemPropertyAttributeDto dto);
Task<ItemPropertyAttributeDto> UpdateAsync(UpdateItemPropertyAttributeDto dto);
Task<bool> DeleteAsync(Guid id);
Task<bool> DeleteByItemIdAsync(Guid itemId);
```

**Manager Pattern**
- `IItemPropertyAttributeManager` - Manager interface
- `ItemPropertyAttributeManager` - Manager implementation (delegates to service)

### Infrastructure Layer (IMS.Infrastructure)

**Service Implementation: ItemPropertyAttributeService**
- Handles all business logic for ItemPropertyAttribute operations
- Includes validation for ItemId and PropertyAttributeId existence
- Maps entities to DTOs for API responses
- Supports filtering by item or property attribute
- Implements soft delete behavior

**Entity Configuration: ItemPropertyAttributeConfiguration**
- Configures foreign key relationships with cascade delete behavior
- Defines unique constraint to prevent duplicate assignments
- Creates indexes for query optimization
- Validates property constraints (Notes max length: 500)

### API Layer (IMS.API)

**Controller: ItemPropertyAttributeController**
```
GET    /api/itempropertyattribute              - Get all assignments
GET    /api/itempropertyattribute/{id}         - Get assignment by ID
GET    /api/itempropertyattribute/item/{itemId} - Get assignments for an item
GET    /api/itempropertyattribute/attribute/{propertyAttributeId} - Get items with attribute
POST   /api/itempropertyattribute              - Create assignment
PUT    /api/itempropertyattribute/{id}         - Update assignment
DELETE /api/itempropertyattribute/{id}         - Delete assignment
DELETE /api/itempropertyattribute/item/{itemId} - Delete all assignments for item
```

**Error Handling**
- 400 Bad Request - Missing required fields or invalid data
- 404 Not Found - Resource not found
- Detailed error messages for debugging

### Dependency Injection (Program.cs)

Registered in Program.cs:
```csharp
// Service
builder.Services.AddScoped<IMS.Application.Interfaces.Product.IItemPropertyAttributeService, 
    IMS.Infrastructure.Services.Product.ItemPropertyAttributeService>();

// Manager
builder.Services.AddScoped<IMS.Application.Managers.Product.IItemPropertyAttributeManager, 
    IMS.Application.Managers.Product.ItemPropertyAttributeManager>();
```

## Frontend Implementation

### Models (product-property.model.ts)

**TypeScript Interfaces**
```typescript
interface ItemPropertyAttribute {
    id: string;
    itemId: string;
    propertyAttributeId: string;
    propertyName?: string;
    propertyAttributeName?: string;
    attributeValue?: string;
    notes?: string;
    displayOrder: number;
}

interface CreateItemPropertyAttributeDto {
    itemId: string;
    propertyAttributeId: string;
    notes?: string;
    displayOrder: number;
}

interface UpdateItemPropertyAttributeDto {
    id: string;
    itemId: string;
    propertyAttributeId: string;
    notes?: string;
    displayOrder: number;
}
```

### Service (ItemPropertyAttributeService)

**HTTP Service for API Communication**
```typescript
@Injectable({ providedIn: 'root' })
export class ItemPropertyAttributeService {
    private readonly apiUrl = '/api/itempropertyattribute';
    
    getAll(): Observable<ItemPropertyAttribute[]>
    getById(id: string): Observable<ItemPropertyAttribute>
    getByItemId(itemId: string): Observable<ItemPropertyAttribute[]>
    getByPropertyAttributeId(propertyAttributeId: string): Observable<ItemPropertyAttribute[]>
    create(dto: CreateItemPropertyAttributeDto): Observable<ItemPropertyAttribute>
    update(id: string, dto: UpdateItemPropertyAttributeDto): Observable<ItemPropertyAttribute>
    delete(id: string): Observable<any>
    deleteByItemId(itemId: string): Observable<any>
}
```

### Component (ItemPropertyAssignmentComponent)

**Standalone Component**
- Selector: `app-item-property-assignment`
- Input: `itemId` (Guid of the item to assign properties to)
- Output: `assignmentUpdated` (emits when assignments change)

**Features**
1. **Dynamic Form**
   - Property dropdown (populated from ProductPropertyService)
   - Value dropdown (dynamically populated based on selected property)
   - Notes field for optional metadata
   - Form validation using Reactive Forms

2. **Assigned Properties List**
   - Displays all currently assigned properties for the item
   - Shows property name, value, and notes
   - Remove button for each assignment with confirmation dialog

3. **State Management**
   - Loading state during API calls
   - Error messages for failed operations
   - Success messages for completed operations
   - Auto-clear messages after 3 seconds

4. **User Experience**
   - Cascading dropdowns (select property → load values)
   - Bootstrap 5 styling
   - Responsive table layout
   - Clear visual feedback for actions

**Component Template Structure**
```html
- Card container with header
- Alert messages (error/success)
- Assignment form
  - Property select dropdown
  - Value select dropdown (conditional)
  - Notes input field
  - Submit button
- Assigned properties table
  - Property name, value, notes
  - Delete button for each row
- Empty state message
- Loading state indicator
```

### Integration with Item Form

**ItemFormComponent Updates**
- Imports `ItemPropertyAssignmentComponent`
- Adds component to imports array
- Displays assignment component when in edit mode (after item is created)
- Located in left column below item form fields

**Template Integration**
```html
<div *ngIf="isEditMode && id" class="mt-3">
    <app-item-property-assignment [itemId]="id"></app-item-property-assignment>
</div>
```

## Usage Flow

### Assigning Properties to an Item

1. **Navigate to Item Form**
   - Create a new item or edit an existing one
   - Fill in item details (name, SKU, unit of measure)
   - Save the item first (required for property assignment)

2. **Assign Properties**
   - In the "Property Assignments" card, select a property from dropdown
   - Available values for that property auto-populate
   - Select a specific value from the values dropdown
   - Add optional notes about the assignment
   - Click "Assign Property"

3. **Manage Assignments**
   - View all assigned properties in the table below
   - Remove assignments by clicking the trash icon
   - Confirm deletion when prompted

### API Usage Examples

**Get all assignments for an item**
```bash
GET /api/itempropertyattribute/item/{itemId}
```

**Assign a property to an item**
```bash
POST /api/itempropertyattribute
Content-Type: application/json

{
  "itemId": "550e8400-e29b-41d4-a716-446655440000",
  "propertyAttributeId": "660e8400-e29b-41d4-a716-446655440000",
  "notes": "Optional notes",
  "displayOrder": 0
}
```

**Get items with specific property attribute**
```bash
GET /api/itempropertyattribute/attribute/{propertyAttributeId}
```

## Database Migration

**To be executed after code deployment:**

```bash
# Create migration
dotnet ef migrations add AddItemPropertyAttributeEntity \
  --project IMS.Infrastructure \
  --startup-project IMS.API

# Apply migration
dotnet ef database update \
  --project IMS.Infrastructure \
  --startup-project IMS.API
```

**Migration will create:**
- `ItemPropertyAttributes` table
- Unique constraint on (ItemId, PropertyAttributeId)
- Three indexes for optimized queries
- Automatic soft-delete behavior

## File Structure

### Backend Files Created
```
IMS.Domain/Entities/Product/
├── ItemPropertyAttribute.cs
├── Item.cs (updated - added navigation property)
└── PropertyAttribute.cs (updated - added navigation property)

IMS.Application/DTOs/Product/
├── ItemPropertyAttributeDto.cs

IMS.Application/Interfaces/Product/
├── IItemPropertyAttributeService.cs

IMS.Application/Managers/Product/
├── IItemPropertyAttributeManager.cs
└── ItemPropertyAttributeManager.cs

IMS.Infrastructure/Services/Product/
├── ItemPropertyAttributeService.cs

IMS.Infrastructure/Persistence/Configurations/Products/
├── ItemPropertyAttributeConfiguration.cs

IMS.API/Controllers/
├── ItemPropertyAttributeController.cs
```

### Frontend Files Created
```
ims.ClientApp/src/app/product/
├── item-property-attribute/
│   └── item-property-attribute.service.ts
├── item-property-assignment/
│   ├── item-property-assignment.component.ts
│   ├── item-property-assignment.component.html
│   └── item-property-assignment.component.css
└── models/ (updated)
    └── product-property.model.ts (added interfaces)
```

### Files Modified
```
IMS.API/Program.cs
├── Added IItemPropertyAttributeService registration
└── Added IItemPropertyAttributeManager registration

IMS.Infrastructure/Persistence/AppDbContext.cs
├── Added ItemPropertyAttributes DbSet

ims.ClientApp/src/app/product/items/item-form/
├── item-form.component.ts (added import & component)
└── item-form.component.html (added assignment component)
```

## Testing Recommendations

### Backend Testing
1. Test creating assignment with valid ItemId and PropertyAttributeId
2. Test validation - invalid ItemId/PropertyAttributeId should return 400
3. Test unique constraint - duplicate assignments should fail
4. Test GetByItemId - returns correct assignments
5. Test cascade delete - deleting item should delete its assignments
6. Test soft delete - deleted assignments should not appear in queries

### Frontend Testing
1. Test property dropdown population
2. Test value dropdown cascading based on property selection
3. Test form validation
4. Test assignment creation and list refresh
5. Test assignment deletion with confirmation
6. Test error handling and display
7. Test responsive layout on different screen sizes
8. Test that assignment component only shows when in edit mode

## Future Enhancements

1. **Bulk Assignment** - Assign multiple properties at once
2. **Template-based Assignment** - Create assignment templates for similar items
3. **Search Filters** - Filter items by assigned properties
4. **Reordering** - Drag-and-drop to reorder assignments
5. **Import/Export** - Bulk import assignments from CSV
6. **Audit Trail** - Track who assigned properties and when
7. **Variant Generation** - Auto-generate item variants from property combinations

## Troubleshooting

### Assignment component not showing
- Ensure item is saved first (must have an ID)
- Check browser console for errors
- Verify component is imported in item-form.component.ts

### Properties not loading in dropdown
- Verify ProductPropertyService is working (test in browser console)
- Check that properties exist in database
- Check browser network tab for API response

### Cannot assign property
- Ensure property and property attribute exist in database
- Check that no duplicate assignment already exists
- Verify ItemId and PropertyAttributeId GUIDs are valid

### Migration fails
- Ensure database is backed up before migration
- Check SQL Server error logs
- Verify EF Core is properly installed in IMS.Infrastructure project
- Check for schema conflicts with existing tables

## API Documentation

### Endpoint: GET /api/itempropertyattribute/item/{itemId}
**Get all property assignments for a specific item**
- **Parameters:** itemId (Guid)
- **Response:** Array of ItemPropertyAttributeDto
- **Status Codes:** 200 OK, 404 Not Found

### Endpoint: POST /api/itempropertyattribute
**Create a new property assignment**
- **Request Body:** CreateItemPropertyAttributeDto
  ```json
  {
    "itemId": "guid",
    "propertyAttributeId": "guid",
    "notes": "string (optional)",
    "displayOrder": 0
  }
  ```
- **Response:** ItemPropertyAttributeDto with created Id
- **Status Codes:** 201 Created, 400 Bad Request

### Endpoint: DELETE /api/itempropertyattribute/{id}
**Delete a property assignment**
- **Parameters:** id (Guid)
- **Response:** { "message": "ItemPropertyAttribute deleted successfully" }
- **Status Codes:** 200 OK, 404 Not Found

## Performance Considerations

1. **Database Indexes:** Three indexes created for common query patterns
2. **Lazy Loading:** PropertyAttribute includes ProductProperty data to minimize queries
3. **Pagination:** List components can be enhanced with pagination for large datasets
4. **Caching:** Consider caching PropertyService results for frequently accessed properties

## Security Notes

1. **Authorization:** API endpoints should require appropriate user permissions
2. **Validation:** All input is validated before database operations
3. **Soft Delete:** Deleted assignments can be audited via audit fields
4. **SQL Injection:** EF Core parameterized queries prevent injection attacks
