using JobTracker.Api.Data;
using JobTracker.Api.Dtos;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Services;

public interface IInterviewService
{
    Task<List<InterviewDto>?> GetAsync(int appId, CancellationToken ct);
    Task<InterviewDto?> CreateAsync(int appId, SaveInterviewDto dto, CancellationToken ct);
    Task<InterviewDto?> UpdateAsync(int appId, int id, SaveInterviewDto dto, CancellationToken ct);
    Task<bool> DeleteAsync(int appId, int id, CancellationToken ct);
    Task<List<UpcomingInterviewDto>> GetUpcomingAsync(int days, CancellationToken ct);
}

public class InterviewService(AppDbContext db) : IInterviewService
{
    public async Task<List<InterviewDto>?> GetAsync(int appId, CancellationToken ct)
    {
        if (!await db.JobApplications.AnyAsync(a => a.Id == appId, ct)) return null;

        return await db.Interviews.AsNoTracking()
            .Where(i => i.JobApplicationId == appId)
            .OrderBy(i => i.ScheduledAt)
            .Select(i => new InterviewDto(i.Id, i.JobApplicationId, i.ScheduledAt, i.Type, i.LocationOrLink, i.Outcome))
            .ToListAsync(ct);
    }

    public async Task<InterviewDto?> CreateAsync(int appId, SaveInterviewDto dto, CancellationToken ct)
    {
        if (!await db.JobApplications.AnyAsync(a => a.Id == appId, ct)) return null;

        var interview = new Interview
        {
            JobApplicationId = appId,
            ScheduledAt = dto.ScheduledAt!.Value,
            Type = dto.Type,
            LocationOrLink = dto.LocationOrLink?.Trim(),
            Outcome = dto.Outcome
        };
        db.Interviews.Add(interview);
        await db.SaveChangesAsync(ct);
        return ToDto(interview);
    }

    public async Task<InterviewDto?> UpdateAsync(int appId, int id, SaveInterviewDto dto, CancellationToken ct)
    {
        var interview = await db.Interviews.FirstOrDefaultAsync(i => i.Id == id && i.JobApplicationId == appId, ct);
        if (interview is null) return null;

        interview.ScheduledAt = dto.ScheduledAt!.Value;
        interview.Type = dto.Type;
        interview.LocationOrLink = dto.LocationOrLink?.Trim();
        interview.Outcome = dto.Outcome;
        await db.SaveChangesAsync(ct);
        return ToDto(interview);
    }

    public async Task<bool> DeleteAsync(int appId, int id, CancellationToken ct)
    {
        var interview = await db.Interviews.FirstOrDefaultAsync(i => i.Id == id && i.JobApplicationId == appId, ct);
        if (interview is null) return false;

        db.Interviews.Remove(interview);
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<List<UpcomingInterviewDto>> GetUpcomingAsync(int days, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var until = now.AddDays(days);

        return await db.Interviews.AsNoTracking()
            .Where(i => i.ScheduledAt >= now && i.ScheduledAt <= until)
            .OrderBy(i => i.ScheduledAt)
            .Select(i => new UpcomingInterviewDto(
                i.Id, i.JobApplicationId, i.JobApplication!.Company, i.JobApplication.Title,
                i.ScheduledAt, i.Type, i.LocationOrLink))
            .ToListAsync(ct);
    }

    private static InterviewDto ToDto(Interview i) =>
        new(i.Id, i.JobApplicationId, i.ScheduledAt, i.Type, i.LocationOrLink, i.Outcome);
}