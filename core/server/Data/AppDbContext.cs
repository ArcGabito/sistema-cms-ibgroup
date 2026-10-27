using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<BlogPost> Posts => Set<BlogPost>();
    public DbSet<ContactSubmission> ContactSubmissions => Set<ContactSubmission>();
    public DbSet<EmployabilityTestSubmission> EmployabilityTestSubmissions => Set<EmployabilityTestSubmission>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ServiceItem> Services => Set<ServiceItem>();
    public DbSet<FaqItem> Faqs => Set<FaqItem>();
    public DbSet<CountryItem> Countries => Set<CountryItem>();
    public DbSet<StatChart> StatCharts => Set<StatChart>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.Username).HasMaxLength(64).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.FullName).HasMaxLength(128).IsRequired();
            entity.Property(u => u.Role).HasMaxLength(32).IsRequired();
            entity.Property(u => u.SecurityStamp).HasMaxLength(64).IsRequired();
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
            entity.HasIndex(c => c.CreatedAt);
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

        modelBuilder.Entity<AuditEntry>(entity =>
        {
            entity.Property(a => a.Username).HasMaxLength(64).IsRequired();
            entity.Property(a => a.Action).HasMaxLength(16).IsRequired();
            entity.Property(a => a.EntityType).HasMaxLength(64).IsRequired();
            entity.Property(a => a.EntityId).HasMaxLength(64);
            entity.Property(a => a.Label).HasMaxLength(200);
            entity.Property(a => a.Details).HasMaxLength(1000);
            entity.HasIndex(a => a.At);
            entity.HasIndex(a => new { a.EntityType, a.At });
        });

        modelBuilder.Entity<ServiceItem>(entity =>
        {
            entity.Property(s => s.Title).HasMaxLength(200).IsRequired();
            entity.Property(s => s.Description).HasMaxLength(1000).IsRequired();
            entity.Property(s => s.CtaLabel).HasMaxLength(60).IsRequired();
            entity.Property(s => s.ImageUrl).HasMaxLength(500).IsRequired();
            entity.Property(s => s.Icon).HasMaxLength(32).IsRequired();
        });

        modelBuilder.Entity<FaqItem>(entity =>
        {
            entity.Property(f => f.Question).HasMaxLength(300).IsRequired();
            entity.Property(f => f.Answer).HasMaxLength(2000).IsRequired();
        });

        modelBuilder.Entity<CountryItem>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(80).IsRequired();
            entity.Property(c => c.Code).HasMaxLength(2).IsRequired();
            entity.Property(c => c.Description).HasMaxLength(500).IsRequired();
        });

        modelBuilder.Entity<StatChart>(entity =>
        {
            entity.Property(s => s.Title).HasMaxLength(200).IsRequired();
            entity.Property(s => s.Description).HasMaxLength(500).IsRequired();
            entity.Property(s => s.Kind).HasMaxLength(16).IsRequired();
            entity.Property(s => s.SeriesLabel).HasMaxLength(60);
            entity.Property(s => s.SecondSeriesLabel).HasMaxLength(60);
            entity.OwnsMany(s => s.Points, points => points.ToJson());
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.Property(c => c.CompanyName).HasMaxLength(200).IsRequired();
            entity.Property(c => c.LegalName).HasMaxLength(200).IsRequired();
            entity.Property(c => c.Industry).HasMaxLength(120);
            entity.Property(c => c.FirstName).HasMaxLength(120);
            entity.Property(c => c.LastName).HasMaxLength(120);
            entity.Property(c => c.JobTitle).HasMaxLength(120);
            entity.Property(c => c.TaxId).HasMaxLength(11);
            entity.Property(c => c.PhoneNumber).HasMaxLength(32);
            entity.Property(c => c.Email).HasMaxLength(200);
            entity.Property(c => c.Website).HasMaxLength(300);
            entity.Property(c => c.Address).HasMaxLength(300);
            entity.Property(c => c.District).HasMaxLength(60);
            entity.Property(c => c.Province).HasMaxLength(60);
            entity.HasIndex(c => c.CompanyName);
            entity.HasIndex(c => c.TaxId);
        });
    }
}
