using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveVendorWarehouseFromGRN : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove VendorId and WarehouseId columns from GoodsReceivedNotes table
            // These are now derived from the linked PurchaseOrder
            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "GoodsReceivedNotes");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "GoodsReceivedNotes");

            // Make PurchaseOrderId required (not nullable)
            migrationBuilder.AlterColumn<Guid>(
                name: "PurchaseOrderId",
                table: "GoodsReceivedNotes",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Re-add VendorId and WarehouseId columns
            migrationBuilder.AddColumn<Guid>(
                name: "VendorId",
                table: "GoodsReceivedNotes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.AddColumn<Guid>(
                name: "WarehouseId",
                table: "GoodsReceivedNotes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: Guid.Empty);

            // Make PurchaseOrderId nullable again
            migrationBuilder.AlterColumn<Guid>(
                name: "PurchaseOrderId",
                table: "GoodsReceivedNotes",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: false);
        }
    }
}
