-- =============================================
-- Category Table Fix Script
-- Run this script to fix the Categories table
-- =============================================

-- Step 1: Check if Categories table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    PRINT 'ERROR: Categories table does not exist!'
    PRINT 'Please run the Entity Framework migrations first.'
    RETURN
END
ELSE
BEGIN
    PRINT '✓ Categories table exists'
END
GO

-- Step 2: Check current structure
PRINT ''
PRINT 'Current Categories table structure:'
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Categories'
ORDER BY ORDINAL_POSITION;
GO

-- Step 3: Add Type column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND name = 'Type')
BEGIN
    PRINT ''
    PRINT 'Adding Type column to Categories table...'
    
    ALTER TABLE [dbo].[Categories]
    ADD [Type] INT NOT NULL DEFAULT 2; -- Default to Expense (2)
    
    PRINT '✓ Type column added successfully!'
END
ELSE
BEGIN
    PRINT ''
    PRINT '✓ Type column already exists.'
END
GO

-- Step 4: Update existing records with proper types
PRINT ''
PRINT 'Updating existing category types...'

-- Set Income categories (you can customize this based on your category names)
UPDATE [dbo].[Categories]
SET [Type] = 1 -- Income
WHERE [Name] IN ('Sales', 'Revenue', 'Income', 'Invoice', 'Service Income', 'Product Sales')
   OR [Name] LIKE '%Income%'
   OR [Name] LIKE '%Revenue%'
   OR [Name] LIKE '%Sales%';

-- Ensure all others are Expense
UPDATE [dbo].[Categories]
SET [Type] = 2 -- Expense
WHERE [Type] = 0 OR [Type] IS NULL;

PRINT '✓ Category types updated!'
GO

-- Step 5: Display results
PRINT ''
PRINT '========================================='
PRINT 'Current Categories:'
PRINT '========================================='
SELECT 
    Id,
    Name,
    [Type],
    CASE [Type] 
        WHEN 1 THEN 'Income'
        WHEN 2 THEN 'Expense'
        ELSE 'Unknown'
    END AS TypeName,
    IsSystemCategory,
    [Description]
FROM [dbo].[Categories]
ORDER BY [Type], Name;
GO

PRINT ''
PRINT '========================================='
PRINT 'Summary:'
PRINT '========================================='
SELECT 
    CASE [Type] 
        WHEN 1 THEN 'Income'
        WHEN 2 THEN 'Expense'
        ELSE 'Unknown'
    END AS CategoryType,
    COUNT(*) AS Count
FROM [dbo].[Categories]
GROUP BY [Type]
ORDER BY [Type];
GO

PRINT ''
PRINT '✓ Database fix complete!'
PRINT 'You can now restart your API and test the categories.'
