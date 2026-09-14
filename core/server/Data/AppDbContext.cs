using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<BlogPost> Posts => Set<BlogPost>();
    public DbSet<ContactSubmission> ContactSubmissions => Set<ContactSubmission>();
    public DbSet<EmployabilityTestSubmission> EmployabilityTestSubmissions => Set<EmployabilityTestSubmission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.Username).HasMaxLength(64).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.FullName).HasMaxLength(128).IsRequired();
            entity.Property(u => u.Role).HasMaxLength(32).IsRequired();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<BlogPost>(entity =>
        {
            entity.Property(p => p.Title).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Slug).HasMaxLength(220).IsRequired();
            entity.Property(p => p.Excerpt).HasMaxLength(500).IsRequired();
            entity.Property(p => p.Content).IsRequired();
            entity.Property(p => p.ImageUrl).HasMaxLength(500);
            entity.HasIndex(p => p.Slug).IsUnique();
            entity.HasOne(p => p.Author)
                .WithMany()
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ContactSubmission>(entity =>
        {
            entity.Property(c => c.Type).HasMaxLength(16).IsRequired();
            entity.Property(c => c.Email).HasMaxLength(200).IsRequired();
            entity.Property(c => c.Telefono).HasMaxLength(32).IsRequired();
            entity.Property(c => c.Mensaje).IsRequired();
            entity.Property(c => c.Nombres).HasMaxLength(120);
            entity.Property(c => c.ApellidoPaterno).HasMaxLength(120);
            entity.Property(c => c.ApellidoMaterno).HasMaxLength(120);
            entity.Property(c => c.Cargo).HasMaxLength(120);
            entity.Property(c => c.Linkedin).HasMaxLength(300);
            entity.Property(c => c.Trabajando).HasMaxLength(16);
            entity.Property(c => c.Servicio).HasMaxLength(120);
            entity.Property(c => c.Sector).HasMaxLength(120);
            entity.Property(c => c.RangoSalarial).HasMaxLength(60);
            entity.Property(c => c.Pais).HasMaxLength(60);
            entity.Property(c => c.Region).HasMaxLength(60);
            entity.Property(c => c.Empresa).HasMaxLength(200);
            entity.Property(c => c.Contacto).HasMaxLength(120);
            entity.Property(c => c.Colaboradores).HasMaxLength(60);
        });

        modelBuilder.Entity<EmployabilityTestSubmission>(entity =>
        {
            entity.Property(e => e.Nombres).HasMaxLength(120).IsRequired();
            entity.Property(e => e.ApellidoPaterno).HasMaxLength(120).IsRequired();
            entity.Property(e => e.ApellidoMaterno).HasMaxLength(120).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Telefono).HasMaxLength(32).IsRequired();
            entity.Property(e => e.TieneLinkedin).HasMaxLength(16);
            entity.Property(e => e.Pais).HasMaxLength(60);
            entity.Property(e => e.Departamento).HasMaxLength(60);
            entity.Property(e => e.NivelProfesional).HasMaxLength(60);
            entity.Property(e => e.Industria).HasMaxLength(120);
            entity.Property(e => e.ActualmenteTrabajando).HasMaxLength(16);
            entity.Property(e => e.UltimoSalario).HasMaxLength(60);
            entity.Property(e => e.RespuestasJson).IsRequired();
            entity.Property(e => e.AutorizaDatos).HasMaxLength(16);
            entity.Property(e => e.DeseaOrientacion).HasMaxLength(16);
        });
    }
}
