# ItemPriceVariant Unique Constraint Removal

## Summary of Changes

Removed the `UK_ItemPriceVariant_ItemPriceId_PropertyAttributeId` unique constraint to allow updating the `PropertyAttributeId` field on existing variants.

## Files Modified

### 1. Backend Configuration
- **File**: `IMS.Infrastructure/Persistence/Configurations/Products/ItemPriceVariantConfiguration.cs`
- **Change**: Removed the alternate key configuration
- **Before**: `builder.HasAlternateKey(x => new { x.ItemPriceId, x.PropertyAttributeId })`
- **After**: Removed this constraint definition

### 2. Backend Service Logic
- **File**: `IMS.Infrastructure/Services/Product/ItemPriceVariantService.cs`
- **Method**: `UpdateAsync()`
- **Changes**:
  - Still prevents modification of `ItemPriceId` (it's the primary key reference)
  - NOW ALLOWS modification of `PropertyAttributeId`
  - Validates the new `PropertyAttributeId` exists before updating
  - Sets `UpdatedAt` timestamp when updating

### 3. Frontend Form Component (TypeScript)
- **File**: `ims.ClientApp/src/app/product/item-price-variant/item-price-variant-form/item-price-variant-form.component.ts`
- **Changes**:
  - `propertyAttributeId` is NO LONGER disabled in edit mode
  - Only `itemPriceId` is disabled in edit mode
  - Also disabled `productPropertyId` to prevent filter changes

### 4. Frontend Form Template (HTML)
- **File**: `ims.ClientApp/src/app/product/item-price-variant/item-price-variant-form/item-price-variant-form.component.html`
- **Changes**:
  - Removed `[disabled]="isEditMode"` from `propertyAttributeId` select
  - Updated info message to reflect new capabilities

### 5. Database Migration
- **File**: `IMS.Infrastructure/Migrations/20260108000001_RemoveItemPriceVariantUniqueConstraint.cs`
- **Change**: Migration that drops the unique constraint in the database

## What Users Can Now Do

✅ **In Edit Mode:**
- Update Property Value (Attribute)
- Update Display Order
- Update Stock Quantity
- Update Variant SKU

❌ **Cannot Change:**
- Item Price (must delete and create new variant)

## How to Apply This Change

### Step 1: Apply the Database Migration
```powershell
cd "D:\Projects\Invoice Management System\InvoiceManagementSystem\IMS.API"
dotnet ef database update
```

### Step 2: Rebuild the Backend
```powershell
dotnet build
```

### Step 3: Restart the Backend Service
Stop and restart your IMS.API service

### Step 4: Rebuild the Frontend
```powershell
cd "D:\Projects\Invoice Management System\InvoiceManagementSystem\ims.ClientApp"
npm start
```

## Testing the Changes

1. Go to the Item Variants page
2. Click Edit on any variant
3. You should now be able to change the Property Value
4. Try changing Display Order, Stock Quantity, or SKU
5. The ItemPrice should remain disabled (cannot change)

## Rollback (if needed)

To revert these changes:
```powershell
cd "D:\Projects\Invoice Management System\InvoiceManagementSystem\IMS.API"
dotnet ef database update 20260107220902_AddedItemPriceVarient
```

This will restore the unique constraint.
