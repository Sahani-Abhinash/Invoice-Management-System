using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedCustomerEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // No-op migration: Customers table already exists in the target database.
            // This migration intentionally does nothing to avoid attempting to create the table again
            // and causing a "There is already an object named 'Customers'" error.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op down: do not drop the Customers table because it may contain existing data.
        }
    }
}
