using JobTracker.Api.Data;
using JobTracker.Api.Dtos;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace JobTracker.Api.Services;

public class JobApplicationService(AppDbContext db) : IJobApplicationService
{
    public async Task<List<JobApplicationDto>> GetAllAsync(CancellationToken ct) =>
        await db.JobApplications
            .AsNoTracking()
            .OrderByDescending(x => x.AppliedDate)
            .Select(x => ToDto(x))
            .ToListAsync(ct);

    public async Task<JobApplicationDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var entity = await db.JobApplications.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<JobApplicationDto> CreateAsync(SaveJobApplicationDto dto, CancellationToken ct)
    {
        var entity = new JobApplication
        {
            Company = dto.Company,
            Title = dto.Title,
            Link = dto.Link,
            AppliedDate = dto.AppliedDate
        };
        db.JobApplications.Add(entity);
        await db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<JobApplicationDto?> UpdateAsync(int id, SaveJobApplicationDto dto, CancellationToken ct)
    {
        var entity = await db.JobApplications.FindAsync([id], ct);
        if (entity is null) return null;

        entity.Company = dto.Company;
        entity.Title = dto.Title;
        entity.Link = dto.Link;
        entity.AppliedDate = dto.AppliedDate;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<JobApplicationDto?> UpdateStageAsync(int id, Stage stage, CancellationToken ct)
    {
        var entity = await db.JobApplications.FindAsync([id], ct);
        if (entity is null) return null;

        entity.Stage = stage;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct)
    {
        var entity = await db.JobApplications.FindAsync([id], ct);
        if (entity is null) return false;

        db.JobApplications.Remove(entity);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static JobApplicationDto ToDto(JobApplication x) =>
        new(x.Id, x.Company, x.Title, x.Link, x.Stage, x.AppliedDate, x.UpdatedAt);
}