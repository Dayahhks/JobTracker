using JobTracker.Api.Dtos;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/applications/{applicationId:int}/notes")]
public class NotesController(INoteService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<NoteDto>>> GetAll(int applicationId, CancellationToken ct)
    {
        var result = await service.GetAsync(applicationId, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create(int applicationId, SaveNoteDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(applicationId, dto, ct);
        return created is null ? NotFound() : StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPut("{noteId:int}")]
    public async Task<ActionResult<NoteDto>> Update(int applicationId, int noteId, SaveNoteDto dto, CancellationToken ct)
    {
        var result = await service.UpdateAsync(applicationId, noteId, dto, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{noteId:int}")]
    public async Task<IActionResult> Delete(int applicationId, int noteId, CancellationToken ct) =>
        await service.DeleteAsync(applicationId, noteId, ct) ? NoContent() : NotFound();
}