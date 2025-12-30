# Resolving Database Migration Conflict

## Problem
The Customers table already exists in the database, but EF Core is trying to create it again, causing a conflict.

## Solution Options

### Option 1: Using SQL Server Management Studio (Recommended)

1. Open SQL Server Management Studio
2. Connect to your database
3. Run the following SQL command:

```sql
DROP TABLE IF EXISTS [Customers];
```

4. Then apply the migrations:

```bash
dotnet ef database update -p IMS.Infrastructure -s IMS.API
```

### Option 2: Using EF Core CLI (Complete Reset)

If you want to completely reset and re-apply all migrations:

```bash
# Navigate to project directory
cd "D:\Projects\Invoice Management System\InvoiceManagementSystem"

# Remove all migrations (WARNING: this resets your database state tracking)
dotnet ef migrations remove -p IMS.Infrastructure -s IMS.API

# Recreate all migrations
dotnet ef migrations script -p IMS.Infrastructure -s IMS.API > migration.sql

# Apply migrations
dotnet ef database update -p IMS.Infrastructure -s IMS.API
```

### Option 3: Drop and Recreate Database

```bash
# Drop the database
dotnet ef database drop -p IMS.Infrastructure -s IMS.API -f

# Recreate from scratch
dotnet ef database update -p IMS.Infrastructure -s IMS.API
```

## What Was Changed

The duplicate migrations have been removed:
- ? Deleted: `20251226000208_AddedCustomer.cs`
- ? Deleted: `20251226000208_AddedCustomer.Designer.cs`

The active migration is now:
- `20251226225150_AddedCustomerEntity.cs` (which includes both Customers table and PoNumber column on Invoices)

## Next Steps

1. Choose one of the solution options above
2. Apply the migration
3. Verify the Customers table exists with correct schema
4. Test the Customer API endpoints

## Verification Query

After applying the migration, verify the table was created correctly:

```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_NAME = 'Customers'
ORDER BY 
    ORDINAL_POSITION;
```

Expected columns:
- Id (uniqueidentifier, NOT NULL)
- Name (nvarchar(max), NOT NULL)
- ContactName (nvarchar(max), NOT NULL)
- Email (nvarchar(max), NOT NULL)
- Phone (nvarchar(max), NOT NULL)
- TaxNumber (nvarchar(max), NOT NULL)
- BranchId (uniqueidentifier, NULL)
- CreatedBy (uniqueidentifier, NULL)
- UpdatedBy (uniqueidentifier, NULL)
- CreatedAt (datetime2, NOT NULL)
- UpdatedAt (datetime2, NULL)
- IsActive (bit, NOT NULL)
- IsDeleted (bit, NOT NULL)
- DeletedBy (uniqueidentifier, NULL)
- DeletedAt (datetime2, NULL)
- RowVersion (rowversion, NULL)
