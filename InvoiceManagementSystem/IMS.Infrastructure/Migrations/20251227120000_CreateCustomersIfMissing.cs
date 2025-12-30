using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateCustomersIfMissing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var sql = @"
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'PoNumber' AND Object_ID = Object_ID(N'dbo.Invoices'))
BEGIN
    ALTER TABLE [dbo].[Invoices] ADD [PoNumber] NVARCHAR(MAX) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [dbo].[Customers](
        [Id] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(MAX) NOT NULL,
        [ContactName] NVARCHAR(MAX) NOT NULL,
        [Email] NVARCHAR(MAX) NOT NULL,
        [Phone] NVARCHAR(MAX) NOT NULL,
        [TaxNumber] NVARCHAR(MAX) NOT NULL,
        [BranchId] UNIQUEIDENTIFIER NULL,
        [CreatedBy] UNIQUEIDENTIFIER NULL,
        [UpdatedBy] UNIQUEIDENTIFIER NULL,
        [CreatedAt] DATETIME2 NOT NULL,
        [UpdatedAt] DATETIME2 NULL,
        [IsActive] BIT NOT NULL,
        [IsDeleted] BIT NOT NULL,
        [DeletedBy] UNIQUEIDENTIFIER NULL,
        [DeletedAt] DATETIME2 NULL,
        [RowVersion] ROWVERSION NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
    );
END

IF EXISTS (SELECT * FROM sys.tables WHERE name='Customers' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Customers_BranchId' AND object_id = OBJECT_ID('dbo.Customers'))
    BEGIN
        CREATE INDEX IX_Customers_BranchId ON dbo.Customers (BranchId);
    END

    IF EXISTS (SELECT * FROM sys.tables WHERE name='Branches')
    BEGIN
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Customers_Branches_BranchId')
        BEGIN
            ALTER TABLE [dbo].[Customers] ADD CONSTRAINT [FK_Customers_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [dbo].[Branches]([Id]);
        END
    END
END
";

            migrationBuilder.Sql(sql);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Intentionally empty: do not drop the Customers table or PoNumber column during a down migration
            // to avoid data loss in environments where they already exist.
        }
    }
}
