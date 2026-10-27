using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddListIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ContactSubmissions_CreatedAt",
                table: "ContactSubmissions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_CompanyName",
                table: "Clients",
                column: "CompanyName");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_TaxId",
                table: "Clients",
                column: "TaxId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ContactSubmissions_CreatedAt",
                table: "ContactSubmissions");

            migrationBuilder.DropIndex(
                name: "IX_Clients_CompanyName",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_TaxId",
                table: "Clients");
        }
    }
}
