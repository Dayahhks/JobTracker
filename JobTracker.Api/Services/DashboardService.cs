using JobTracker.Api.Data;
using JobTracker.Api.Dtos;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetAsync(CancellationToken ct);
}

public class DashboardService(AppDbContext db) : IDashboardService
{
    private const int WeeksShown = 12;

    public async Task<DashboardDto> GetAsync(CancellationToken ct)
    {
        var q = db.JobApplications.AsNoTracking();

        // Totals per stage: one GROUP BY query in SQL
        var stageRows = await q.GroupBy(x => x.Stage)
            .Select(g => new { Stage = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var byStage = Enum.GetValues<Stage>().ToDictionary(
            s => s.ToString(),
            s => stageRows.FirstOrDefault(r => r.Stage == s)?.Count ?? 0);

        var total = byStage.Values.Sum();
        var reachedInterview = byStage["Interview"] + byStage["Offer"];

        // Per source: another GROUP BY
        var sourceRows = await q.GroupBy(x => x.Source)
            .Select(g => new { Source = g.Key, Count = g.Count() })
            .ToListAsync(ct);
        var bySource = sourceRows
            .Select(r => new SourceCountDto(r.Source ?? "Not set", r.Count))
            .OrderByDescending(s => s.Count)
            .ToList();

        // Per week: fetch only the dates of the last 12 weeks, then group by Monday
        var firstWeek = StartOfWeek(DateTime.UtcNow.Date).AddDays(-7 * (WeeksShown - 1));
        var dates = await q.Where(x => x.AppliedDate >= firstWeek)
            .Select(x => x.AppliedDate)
            .ToListAsync(ct);
        var counts = dates.GroupBy(d => StartOfWeek(d.Date)).ToDictionary(g => g.Key, g => g.Count());

        var weekly = Enumerable.Range(0, WeeksShown)
            .Select(i =>
            {
                var week = firstWeek.AddDays(7 * i);
                return new WeeklyCountDto(DateOnly.FromDateTime(week), counts.GetValueOrDefault(week));
            })
            .ToList();

        return new DashboardDto(
            total, byStage,
            Percent(reachedInterview, total),
            Percent(byStage["Offer"], total),
            weekly, bySource);
    }

    private static double Percent(int part, int whole) =>
        whole == 0 ? 0 : Math.Round(part * 100.0 / whole, 1);

    private static DateTime StartOfWeek(DateTime date) =>
        date.AddDays(-(((int)date.DayOfWeek + 6) % 7));   // Monday
}