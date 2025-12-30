-- Cleanup script to remove duplicate EntityAddress entries for Customers
-- This keeps only the most recently created (or primary) address link per customer
-- Run this script manually after deploying the updated LinkToOwnerAsync logic

-- First, let's see what duplicates exist
SELECT 
    OwnerId,
    COUNT(*) as AddressCount
FROM EntityAddresses
WHERE OwnerType = 'Customer'
  AND IsDeleted = 0
GROUP BY OwnerId
HAVING COUNT(*) > 1;

-- Now remove duplicates, keeping only the primary one, or the most recent if no primary exists
WITH RankedAddresses AS (
    SELECT 
        Id,
        OwnerId,
        AddressId,
        IsPrimary,
        CreatedAt,
        ROW_NUMBER() OVER (
            PARTITION BY OwnerId 
            ORDER BY 
                IsPrimary DESC,  -- Primary first
                CreatedAt DESC   -- Then most recent
        ) AS RowNum
    FROM EntityAddresses
    WHERE OwnerType = 'Customer'
      AND IsDeleted = 0
)
DELETE FROM EntityAddresses
WHERE Id IN (
    SELECT Id 
    FROM RankedAddresses 
    WHERE RowNum > 1  -- Delete all except the top-ranked one per customer
);

-- Verify cleanup
SELECT 
    OwnerId,
    COUNT(*) as AddressCount
FROM EntityAddresses
WHERE OwnerType = 'Customer'
  AND IsDeleted = 0
GROUP BY OwnerId
HAVING COUNT(*) > 1;
-- Should return 0 rows if cleanup was successful
