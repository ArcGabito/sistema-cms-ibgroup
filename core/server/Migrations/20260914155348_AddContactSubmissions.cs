using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddContactSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Cargo = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Servicio = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Mensaje = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nombres = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ApellidoPaterno = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ApellidoMaterno = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Linkedin = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Trabajando = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: true),
                    Sector = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    RangoSalarial = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Pais = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Region = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Empresa = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Contacto = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Colaboradores = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactSubmissions", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactSubmissions");
        }
    }
}
