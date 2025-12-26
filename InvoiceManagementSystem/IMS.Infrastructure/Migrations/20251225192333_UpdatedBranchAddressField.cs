using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedBranchAddressField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "AddressId",
                table: "Branches");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Branches",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "AddressId",
                table: "Branches",
                type: "uniqueidentifier",
                nullable: true);
        }
    }
}
