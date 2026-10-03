using JobTracker.Api.Data;
using JobTracker.Api.Dtos;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Services;

public interface INoteService
{
    Task<List<NoteDto>?> GetAsync(int appId, CancellationToken ct);          // null = application not found
    Task<NoteDto?> CreateAsync(int appId, SaveNoteDto dto, CancellationToken ct);
    Task<NoteDto?> UpdateAsync(int appId, int noteId, SaveNoteDto dto, CancellationToken ct);
    Task<bool> DeleteAsync(int appId, int noteId, CancellationToken ct);
}

public class NoteService(AppDbContext db) : INoteService
{
    public async Task<List<NoteDto>?> GetAsync(int appId, CancellationToken ct)
    {
        if (!await db.JobApplications.AnyAsync(a => a.Id == appId, ct)) return null;

        return await db.Notes.AsNoTracking()
            .Where(n => n.JobApplicationId == appId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NoteDto(n.Id, n.Text, n.CreatedAt, n.UpdatedAt))
            .ToListAsync(ct);
    }

    public async Task<NoteDto?> CreateAsync(int appId, SaveNoteDto dto, CancellationToken ct)
    {
        if (!await db.JobApplications.AnyAsync(a => a.Id == appId, ct)) return null;

        var now = DateTime.UtcNow;
        var note = new Note { JobApplicationId = appId, Text = dto.Text.Trim(), CreatedAt = now, UpdatedAt = now };
        db.Notes.Add(note);
        await db.SaveChangesAsync(ct);
        return ToDto(note);
    }

    public async Task<NoteDto?> UpdateAsync(int appId, int noteId, SaveNoteDto dto, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == noteId && n.JobApplicationId == appId, ct);
        if (note is null) return null;

        note.Text = dto.Text.Trim();
        note.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return ToDto(note);
    }

    public async Task<bool> DeleteAsync(int appId, int noteId, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == noteId && n.JobApplicationId == appId, ct);
        if (note is null) return false;

        db.Notes.Remove(note);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static NoteDto ToDto(Note n) => new(n.Id, n.Text, n.CreatedAt, n.UpdatedAt);
}