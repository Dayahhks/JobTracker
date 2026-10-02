using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<JobApplication> JobApplications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobApplication>(e =>
        {
            e.Property(x => x.Company)
                .IsRequired()
                .HasMaxLength(200);

            e.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(200);

            e.Property(x => x.Stage)
                .HasConversion<string>()
                .HasMaxLength(20);
        });

        base.OnModelCreating(modelBuilder);
    }
}
