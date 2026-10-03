using JobTracker.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);   

        modelBuilder.Entity<JobApplication>(e =>
        {
            e.Property(x => x.Company).IsRequired().HasMaxLength(200);
            e.Property(x => x.Title).IsRequired().HasMaxLength(200);
            e.Property(x => x.Stage).HasConversion<string>().HasMaxLength(20);
        });
    }
}