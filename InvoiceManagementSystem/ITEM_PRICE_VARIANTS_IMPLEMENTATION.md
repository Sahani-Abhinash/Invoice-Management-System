# Item Price Variants Implementation Guide

## Overview
This guide explains the Item Variant system - a complete implementation for managing product variants like Amazon/Flipkart (Color: White, Red, Blue | Size: S, M, L, XL).

## Architecture

### Database Structure

```
ItemPrice (Base price for a product)
    ↓
ItemPriceVariant (Represents one variant option)
    ├─ ItemPriceId (FK to ItemPrice)
    ├─ PropertyAttributeId (FK to PropertyAttribute - specific variant value)
    ├─ DisplayOrder (for UI ordering)
    ├─ StockQuantity (optional - stock for this variant)
    └─ VariantSKU (optional - unique SKU for variant)
    
PropertyAttribute (e.g., "White", "Size M")
    ↓
ProductProperty (e.g., "Color", "Size")
```

### How It Works

1. **Product Properties** (e.g., "Color", "Size")
   - Create these first in Products → Properties

2. **Property Attributes** (e.g., Color has values: Red, White, Blue)
   - Create these in Products → Attributes
   - Each attribute belongs to a property

3. **Item Prices** (e.g., T-Shirt Price = $10)
   - A base price for a product

4. **Item Price Variants** (e.g., Red T-Shirt, White T-Shirt, Blue M Size)
   - Multiple variants can share the same price
   - Each variant links a PropertyAttribute to an ItemPrice

## Real-World Example

**Product**: T-Shirt ($10)

**Variants Available**:
```
Color: Red    + Size: S    = Variant 1 (Stock: 50)
Color: Red    + Size: M    = Variant 2 (Stock: 30)
Color: White  + Size: S    = Variant 3 (Stock: 40)
Color: White  + Size: M    = Variant 4 (Stock: 20)
```

Each of these is an **ItemPriceVariant** record linking to:
- 1 ItemPrice (the $10 price)
- 1 PropertyAttribute (e.g., "Red" or "Size M")

## Files Created

### Backend

**Domain Layer** (`IMS.Domain/`)
- `Entities/Product/ItemPriceVariant.cs` - Main entity

**Application Layer** (`IMS.Application/`)
- `DTOs/Product/ItemPriceVariantDto.cs` - Data Transfer Objects
- `Interfaces/Product/IItemPriceVariantService.cs` - Service interface
- `Managers/Product/ItemPriceVariantManager.cs` - Manager pattern implementation

**Infrastructure Layer** (`IMS.Infrastructure/`)
- `Services/Product/ItemPriceVariantService.cs` - Business logic
- `Persistence/Configurations/Products/ItemPriceVariantConfiguration.cs` - DB mapping

**API Layer** (`IMS.API/`)
- `Controllers/ItemPriceVariantController.cs` - API endpoints
- `Program.cs` - Service registration (updated)

### Frontend

**Models** (`ims.ClientApp/src/app/models/`)
- `product-property.model.ts` - TypeScript interfaces (updated)

**Services** (`ims.ClientApp/src/app/product/item-price-variant/`)
- `item-price-variant.service.ts` - API communication

**Components** (`ims.ClientApp/src/app/product/item-price-variant/`)
- **VariantSelectorComponent** - For customers to select variants
  - Located: `variant-selector/`
  - Files: `.ts`, `.html`, `.css`
  
- **VariantManagerComponent** - For admins to manage variants
  - Located: `variant-manager/`
  - Files: `.ts`, `.html`, `.css`

## API Endpoints

### Get All Variants
```http
GET /api/itempricevariants
```
Returns all variants in the system

### Get Single Variant
```http
GET /api/itempricevariants/{id}
```

### Get Variants for a Product (IMPORTANT FOR SHOPPING)
```http
GET /api/itempricevariants/itemprice/{itemPriceId}
```
**Usage**: When showing a product page, get all variants for that price
**Returns**: List of all color/size options available

**Example Response**:
```json
[
  {
    "id": "uuid-1",
    "itemPriceId": "uuid-product",
    "propertyAttributeId": "uuid-red",
    "propertyName": "Color",
    "attributeValue": "Red",
    "displayLabel": "Color: Red",
    "displayOrder": 0,
    "stockQuantity": 50,
    "variantSKU": "RED-S",
    "price": 10.00
  },
  {
    "id": "uuid-2",
    "itemPriceId": "uuid-product",
    "propertyAttributeId": "uuid-white",
    "propertyName": "Color",
    "attributeValue": "White",
    "displayLabel": "Color: White",
    "displayOrder": 1,
    "stockQuantity": 40,
    "variantSKU": "WHITE-S",
    "price": 10.00
  }
]
```

### Get All Products with Specific Variant
```http
GET /api/itempricevariants/propertyattribute/{propertyAttributeId}
```
**Usage**: Find all products with "Red" color, or all products in "Size M"

### Create Variant
```http
POST /api/itempricevariants
Content-Type: application/json

{
  "itemPriceId": "uuid-product",
  "propertyAttributeId": "uuid-red",
  "displayOrder": 0,
  "stockQuantity": 50,
  "variantSKU": "RED-S"
}
```

### Update Variant
```http
PUT /api/itempricevariants/{id}
Content-Type: application/json

{
  "id": "uuid-1",
  "itemPriceId": "uuid-product",
  "propertyAttributeId": "uuid-red",
  "displayOrder": 0,
  "stockQuantity": 45,
  "variantSKU": "RED-S"
}
```

### Delete Variant
```http
DELETE /api/itempricevariants/{id}
```

### Delete All Variants for a Product
```http
DELETE /api/itempricevariants/itemprice/{itemPriceId}
```

## Angular Component Usage

### VariantSelectorComponent (For Shopping)

Use this in your product detail page:

```html
<app-variant-selector 
  [itemPriceId]="selectedProduct.id"
  (variantSelected)="onVariantSelected($event)"
  (variantCleared)="onVariantCleared()">
</app-variant-selector>
```

**Component Events**:
- `variantSelected` - Emits when user selects a variant
- `variantCleared` - Emits when user clears selection

**Example Handler**:
```typescript
onVariantSelected(variant: ItemPriceVariant): void {
  console.log('Selected:', variant);
  // Add to cart with selected variant
  this.cartService.addItem({
    productId: this.product.id,
    variantId: variant.id,
    variantName: variant.displayLabel,
    quantity: this.quantity
  });
}
```

### VariantManagerComponent (For Admin)

Use this in your item price edit page:

```html
<app-variant-manager [itemPriceId]="editingPriceId"></app-variant-manager>
```

This component handles:
- ✅ Display all variants
- ✅ Add new variants
- ✅ Edit existing variants
- ✅ Delete variants
- ✅ Stock management
- ✅ SKU assignment

## Setup Steps

### 1. Run Database Migration

```powershell
cd "d:\Projects\Invoice Management System\InvoiceManagementSystem"
dotnet ef database update --project IMS.Infrastructure --startup-project IMS.API
```

This creates the `ItemPriceVariants` table in your database.

### 2. Create Product Properties (One-Time Setup)

If you haven't already, create properties in the admin panel:
- Go to Products → Properties
- Create "Color"
- Create "Size"
- Create any other properties you need

### 3. Create Property Attributes

For each property, add its values:
- **Color**: Red, White, Blue, Green, Black, etc.
- **Size**: XS, S, M, L, XL, XXL, etc.

### 4. Create Item Prices

Create prices for your products in Products → Prices

### 5. Add Variants (Admin)

For each price, use the **Variant Manager** component to add variants:
- Select Color → Red → Add
- Select Color → White → Add
- Select Size → S → Add
- Select Size → M → Add
- etc.

### 6. Display in Shopping Cart

In your shopping cart/product page, use **VariantSelector** component to let customers choose variants.

## Example Scenario

**Scenario**: T-Shirt with Color and Size variants

### Step 1: Setup Properties & Attributes
```
Property: Color
├─ Attribute: Red
├─ Attribute: White
└─ Attribute: Blue

Property: Size
├─ Attribute: S
├─ Attribute: M
├─ Attribute: L
└─ Attribute: XL
```

### Step 2: Create Item Price
```
Item: T-Shirt
Price: $10.00
PriceList: Retail
EffectiveFrom: Jan 1, 2026
```

### Step 3: Add Variants
```
ItemPrice → Variant
T-Shirt   → Red + S (Stock: 50)
T-Shirt   → Red + M (Stock: 30)
T-Shirt   → White + S (Stock: 40)
T-Shirt   → White + M (Stock: 25)
T-Shirt   → Blue + S (Stock: 35)
T-Shirt   → Blue + M (Stock: 20)
```

### Step 4: Customer Shopping Experience
1. Customer visits T-Shirt product page
2. Variant Selector shows:
   - **Color**: Red, White, Blue (buttons)
   - **Size**: S, M, L, XL (buttons)
3. Customer selects Red color → Size M
4. System shows: "Color: Red | Size: M - Stock: 30 - Price: $10.00"
5. Customer adds to cart

## Database Schema

```sql
CREATE TABLE ItemPriceVariants (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ItemPriceId UNIQUEIDENTIFIER NOT NULL,
    PropertyAttributeId UNIQUEIDENTIFIER NOT NULL,
    DisplayOrder INT DEFAULT 0,
    StockQuantity INT NULL,
    VariantSKU NVARCHAR(100) NULL,
    IsDeleted BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy NVARCHAR(MAX) NULL,
    UpdatedAt DATETIME NULL,
    UpdatedBy NVARCHAR(MAX) NULL,
    DeletedAt DATETIME NULL,
    
    CONSTRAINT FK_ItemPriceVariant_ItemPrice FOREIGN KEY (ItemPriceId) REFERENCES ItemPrices(Id),
    CONSTRAINT FK_ItemPriceVariant_PropertyAttribute FOREIGN KEY (PropertyAttributeId) REFERENCES PropertyAttributes(Id),
    CONSTRAINT UK_ItemPriceVariant_Unique UNIQUE(ItemPriceId, PropertyAttributeId),
    INDEX IX_ItemPriceVariant_ItemPriceId,
    INDEX IX_ItemPriceVariant_PropertyAttributeId
)
```

## Key Features

✅ **Multiple Variants per Product**: One ItemPrice can have many variants
✅ **Stock Tracking**: Track stock for each variant separately
✅ **SKU Management**: Optional unique SKU per variant combination
✅ **Display Ordering**: Control the order variants appear in UI
✅ **Soft Delete**: Variants marked as deleted, not removed from DB
✅ **Validation**: Prevents duplicate variant combinations
✅ **Performance**: Optimized with indexes on ItemPriceId and PropertyAttributeId
✅ **Audit Trail**: CreatedAt, UpdatedAt, DeletedAt tracking

## Important Notes

1. **Each variant must have a unique combination** of (ItemPriceId, PropertyAttributeId)
   - You cannot create Red color twice for the same price
   - This is enforced by database unique constraint

2. **Variants can share the same price**
   - Red T-Shirt and White T-Shirt can both be $10

3. **PropertyAttribute is reusable**
   - "Red" color can be used for T-Shirts, Dresses, Shoes, etc.

4. **Delete behavior**:
   - Deleting an ItemPrice CASCADE deletes all its variants
   - Deleting a PropertyAttribute is RESTRICTED (cannot delete if used by variants)

## Troubleshooting

### Migration Issues
If migration fails, check:
1. Connection string is correct
2. Database exists
3. EF Core is installed: `dotnet ef --version`
4. Run from project root directory

### Component Not Loading
1. Check console for errors (F12)
2. Verify itemPriceId is passed correctly
3. Ensure API endpoint is accessible
4. Check Network tab in browser dev tools

### API Returns 400 Bad Request
1. Check FormData is correct JSON
2. Verify itemPriceId exists
3. Verify propertyAttributeId exists
4. Check for duplicate variant combination

## Next Steps

1. **Run the migration** to create the database table
2. **Create Properties & Attributes** through admin UI
3. **Add Variants** to your products using VariantManager
4. **Display Variants** in shopping cart using VariantSelector
5. **Update Cart Logic** to handle variant selection

## Support & Questions

Refer to the implementation files:
- Backend logic: `/IMS.Infrastructure/Services/Product/ItemPriceVariantService.cs`
- API endpoints: `/IMS.API/Controllers/ItemPriceVariantController.cs`
- Frontend service: `/ims.ClientApp/src/app/product/item-price-variant/item-price-variant.service.ts`
