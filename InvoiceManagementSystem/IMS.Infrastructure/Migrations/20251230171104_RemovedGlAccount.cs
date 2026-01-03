using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovedGlAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransactionCategories_Accounts_GlAccountId",
                table: "TransactionCategories");

            migrationBuilder.DropIndex(
                name: "IX_TransactionCategories_GlAccountId",
                table: "TransactionCategories");

            migrationBuilder.DropColumn(
                name: "GlAccountId",
                table: "TransactionCategories");

            migrationBuilder.AddColumn<Guid>(
                name: "AccountId",
                table: "TransactionCategories",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransactionCategories_AccountId",
                table: "TransactionCategories",
                column: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionCategories_Accounts_AccountId",
                table: "TransactionCategories",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransactionCategories_Accounts_AccountId",
                table: "TransactionCategories");

            migrationBuilder.DropIndex(
                name: "IX_TransactionCategories_AccountId",
                table: "TransactionCategories");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "TransactionCategories");

            migrationBuilder.AddColumn<Guid>(
                name: "GlAccountId",
                table: "TransactionCategories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_TransactionCategories_GlAccountId",
                table: "TransactionCategories",
                column: "GlAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionCategories_Accounts_GlAccountId",
                table: "TransactionCategories",
                column: "GlAccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
