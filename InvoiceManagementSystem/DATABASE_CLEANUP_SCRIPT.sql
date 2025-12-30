-- SQL to drop and recreate the Customers table
-- Run this in SQL Server Management Studio or your database tool

-- Drop the existing Customers table (if it exists)
DROP TABLE IF EXISTS [Customers];

-- Now apply the migration using EF Core CLI
-- dotnet ef database update -p IMS.Infrastructure -s IMS.API

-- Or manually run the migration script below:

-- CreateTable Customers
CREATE TABLE [Customers] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [ContactName] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Phone] nvarchar(max) NOT NULL,
    [TaxNumber] nvarchar(max) NOT NULL,
    [BranchId] uniqueidentifier NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedBy] uniqueidentifier NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    [DeletedBy] uniqueidentifier NULL,
    [DeletedAt] datetime2 NULL,
    [RowVersion] rowversion NULL,
    CONSTRAINT [PK_Customers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Customers_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id])
);

-- Create Index on BranchId
CREATE INDEX [IX_Customers_BranchId] ON [Customers] ([BranchId]);
