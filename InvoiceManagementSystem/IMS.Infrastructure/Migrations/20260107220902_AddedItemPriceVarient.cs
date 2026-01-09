using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedItemPriceVarient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ItemPriceVariants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemPriceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PropertyAttributeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    StockQuantity = table.Column<int>(type: "int", nullable: true),
                    VariantSKU = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
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
                    table.PrimaryKey("PK_ItemPriceVariants", x => x.Id);
                    table.UniqueConstraint("UK_ItemPriceVariant_ItemPriceId_PropertyAttributeId", x => new { x.ItemPriceId, x.PropertyAttributeId });
                    table.ForeignKey(
                        name: "FK_ItemPriceVariants_ItemPrices_ItemPriceId",
                        column: x => x.ItemPriceId,
                        principalTable: "ItemPrices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemPriceVariants_PropertyAttributes_PropertyAttributeId",
                        column: x => x.PropertyAttributeId,
                        principalTable: "PropertyAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemPriceVariant_ItemPriceId",
                table: "ItemPriceVariants",
                column: "ItemPriceId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemPriceVariant_PropertyAttributeId",
                table: "ItemPriceVariants",
                column: "PropertyAttributeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemPriceVariants");
        }
    }
}
