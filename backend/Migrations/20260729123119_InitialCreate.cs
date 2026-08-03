using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Empleados",
                columns: table => new
                {
                    Codigo = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Nombres = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    TipoDocumento = table.Column<string>(type: "TEXT", maxLength: 11, nullable: true),
                    Cedula = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    EStatus = table.Column<string>(type: "TEXT", maxLength: 15, nullable: false),
                    Puesto = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    FechaNacimiento = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleados", x => x.Codigo);
                });

            migrationBuilder.CreateTable(
                name: "NominaPeriodos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Mes = table.Column<int>(type: "INTEGER", nullable: false),
                    Quincena = table.Column<string>(type: "TEXT", maxLength: 5, nullable: false),
                    Concepto = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    FechaProcesado = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MontoTotalDevengado = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontoTotalDeducciones = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontoTotalNeto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Estado = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NominaPeriodos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NominaDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NominaPeriodoId = table.Column<int>(type: "INTEGER", nullable: false),
                    CodigoEmpleado = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    NombreEmpleadoSnapshot = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    CedulaSnapshot = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    EmailDestinatario = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    SueldoPeriodo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Incentivo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Reembolso = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HorasExtras = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Prestamo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CuotaCumpleanos = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDevengado = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SeguroVehiculo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SeguroMedico = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Sfs = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Afp = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Isr = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDeducciones = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetoPagado = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CorreoEnviado = table.Column<bool>(type: "INTEGER", nullable: false),
                    FechaEnvioCorreo = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NominaDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NominaDetalles_NominaPeriodos_NominaPeriodoId",
                        column: x => x.NominaPeriodoId,
                        principalTable: "NominaPeriodos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NominaDetalles_NominaPeriodoId",
                table: "NominaDetalles",
                column: "NominaPeriodoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Empleados");

            migrationBuilder.DropTable(
                name: "NominaDetalles");

            migrationBuilder.DropTable(
                name: "NominaPeriodos");
        }
    }
}
