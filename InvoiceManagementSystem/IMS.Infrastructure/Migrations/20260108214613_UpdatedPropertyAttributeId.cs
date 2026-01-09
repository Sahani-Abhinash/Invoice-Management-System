using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedPropertyAttributeId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "UK_ItemPriceVariant_ItemPriceId_PropertyAttributeId",
                table: "ItemPriceVariants");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddUniqueConstraint(
                name: "UK_ItemPriceVariant_ItemPriceId_PropertyAttributeId",
                table: "ItemPriceVariants",
                columns: new[] { "ItemPriceId", "PropertyAttributeId" });
        }
    }
}
