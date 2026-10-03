using JobTracker.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace JobTracker.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Interview> Interviews => Set<Interview>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // SQL Server returns dates with no time zone. This marks them as UTC,
        // so the JSON gets a "Z" and the browser shows the correct local time.
        var utc = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        modelBuilder.Entity<JobApplication>(e =>
        {
            e.Property(x => x.Company).IsRequired().HasMaxLength(200);
            e.Property(x => x.Title).IsRequired().HasMaxLength(200);
            e.Property(x => x.Stage).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Source).HasMaxLength(50);
        });

        modelBuilder.Entity<Note>(e =>
        {
            e.Property(x => x.Text).IsRequired().HasMaxLength(2000);
            e.Property(x => x.CreatedAt).HasConversion(utc);
            e.Property(x => x.UpdatedAt).HasConversion(utc);
            e.HasOne(x => x.JobApplication).WithMany(x => x.Notes)
                .HasForeignKey(x => x.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);   // deleting an application deletes its notes
        });

        modelBuilder.Entity<Interview>(e =>
        {
            e.Property(x => x.ScheduledAt).HasConversion(utc);
            e.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Outcome).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.LocationOrLink).HasMaxLength(500);
            e.HasIndex(x => x.ScheduledAt);
            e.HasOne(x => x.JobApplication).WithMany(x => x.Interviews)
                .HasForeignKey(x => x.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}