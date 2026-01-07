using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedProductPropertyAndAttributeToItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ItemPropertyAttributes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PropertyAttributeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemPropertyAttributes", x => x.Id);
                    table.UniqueConstraint("UK_ItemPropertyAttribute_ItemId_PropertyAttributeId", x => new { x.ItemId, x.PropertyAttributeId });
                    table.ForeignKey(
                        name: "FK_ItemPropertyAttributes_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemPropertyAttributes_PropertyAttributes_PropertyAttributeId",
                        column: x => x.PropertyAttributeId,
                        principalTable: "PropertyAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemPropertyAttribute_ItemId",
                table: "ItemPropertyAttributes",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemPropertyAttribute_ItemId_DisplayOrder",
                table: "ItemPropertyAttributes",
                columns: new[] { "ItemId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ItemPropertyAttribute_PropertyAttributeId",
                table: "ItemPropertyAttributes",
                column: "PropertyAttributeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemPropertyAttributes");
        }
    }
}
