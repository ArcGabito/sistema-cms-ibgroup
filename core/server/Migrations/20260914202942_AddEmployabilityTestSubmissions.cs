using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployabilityTestSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmployabilityTestSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombres = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ApellidoPaterno = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ApellidoMaterno = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    TieneLinkedin = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Pais = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Departamento = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Edad = table.Column<int>(type: "int", nullable: false),
                    NivelProfesional = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Industria = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ActualmenteTrabajando = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    UltimoSalario = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    RespuestasJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PuntajeTotal = table.Column<int>(type: "int", nullable: false),
                    PuntajePromedio = table.Column<double>(type: "float", nullable: false),
                    AutorizaDatos = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    DeseaOrientacion = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployabilityTestSubmissions", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmployabilityTestSubmissions");
        }
    }
}
