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
        public DbSet<EventoRecordatorio> EventosRecordatorios => Set<EventoRecordatorio>();
        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<SesionUsuario> SesionesUsuarios => Set<SesionUsuario>();
        public DbSet<AuditoriaAccion> AuditoriasAcciones => Set<AuditoriaAccion>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Empleado>()
                .HasKey(e => e.Codigo);

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<SesionUsuario>()
                .HasIndex(s => s.Token)
                .IsUnique();

            modelBuilder.Entity<NominaPeriodo>()
                .HasMany(p => p.Detalles)
                .WithOne(d => d.NominaPeriodo)
                .HasForeignKey(d => d.NominaPeriodoId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<AuditoriaAccion>()
                .HasIndex(a => a.UsuarioId);
                
            modelBuilder.Entity<AuditoriaAccion>()
                .HasIndex(a => a.FechaHora);
        }
    }
}