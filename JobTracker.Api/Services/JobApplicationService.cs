using JobTracker.Api.Data;
using JobTracker.Api.Dtos;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Services;

public class JobApplicationService(AppDbContext db) : IJobApplicationService
{
    public async Task<PagedResult<JobApplicationDto>> GetAllAsync(ApplicationQuery q, CancellationToken ct)
    {
        var query = db.JobApplications.AsNoTracking();

        // 1. Search
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var term = q.Search.Trim();
            query = query.Where(x => x.Company.Contains(term) || x.Title.Contains(term));
        }

        // 2. Filter
        if (q.Stage is not null)
            query = query.Where(x => x.Stage == q.Stage);

        // 3. Count (before paging)
        var totalCount = await query.CountAsync(ct);

        // 4. Sort (whitelist)
        var desc = q.SortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
        IOrderedQueryable<JobApplication> ordered = q.SortBy.ToLowerInvariant() switch
        {
            "company" => desc ? query.OrderByDescending(x => x.Company) : query.OrderBy(x => x.Company),
            "title" => desc ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            "stage" => desc ? query.OrderByDescending(x => x.Stage) : query.OrderBy(x => x.Stage),
            "updatedat" => desc ? query.OrderByDescending(x => x.UpdatedAt) : query.OrderBy(x => x.UpdatedAt),
            _ => desc ? query.OrderByDescending(x => x.AppliedDate) : query.OrderBy(x => x.AppliedDate)
        };

        // 5. Page
        var items = await ordered
            .ThenBy(x => x.Id) // tie-breaker
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .Select(x => ToDto(x))
            .ToListAsync(ct);

        var totalPages = (int)Math.Ceiling(totalCount / (double)q.PageSize);
        return new PagedResult<JobApplicationDto>(items, q.Page, q.PageSize, totalCount, totalPages);
    }

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
