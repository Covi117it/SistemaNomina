using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

    public DbSet<Empleado> Empleados => Set<Empleado>();
    public DbSet<NominaPeriodo> NominaPeriodos => Set<NominaPeriodo>();
    public DbSet<NominaDetalle> NominaDetalles => Set<NominaDetalle>();
    public DbSet<ConfiguracionSistema> Configuraciones => Set<ConfiguracionSistema>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Configuración de la clave primaria de Empleado
        modelBuilder.Entity<Empleado>()
            .HasKey(e => e.Codigo);
        // Relación: Un período de nómina contiene muchos detalles de empleados
        modelBuilder.Entity<NominaPeriodo>()
            .HasMany(p => p.Detalles)
            .WithOne(d => d.NominaPeriodo)
            .HasForeignKey(d => d.NominaPeriodoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

}