-- Add Type column to Categories table
-- This migration adds the IncomeExpenseType field to existing Category records

-- First, add the Type column with a default value
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND name = 'Type')
BEGIN
    ALTER TABLE [dbo].[Categories]
    ADD [Type] INT NOT NULL DEFAULT 2; -- Default to Expense (2)
END
GO

-- Update existing records with appropriate type
-- You may want to customize this based on your category names
UPDATE [dbo].[Categories]
SET [Type] = 1 -- Income
WHERE [Name] IN ('Sales', 'Revenue', 'Income', 'Invoice', 'Service Income', 'Product Sales')
  OR [Name] LIKE '%Income%'
  OR [Name] LIKE '%Revenue%'
  OR [Name] LIKE '%Sales%';
GO

-- All others remain as Expense (2) which is the default
UPDATE [dbo].[Categories]
SET [Type] = 2 -- Expense
WHERE [Type] IS NULL OR [Type] = 0;
GO

-- Verify the changes
SELECT Id, Name, [Type], 
       CASE [Type] 
           WHEN 1 THEN 'Income'
           WHEN 2 THEN 'Expense'
           ELSE 'Unknown'
       END AS TypeName,
       IsSystemCategory
FROM [dbo].[Categories]
ORDER BY [Type], Name;
GO
