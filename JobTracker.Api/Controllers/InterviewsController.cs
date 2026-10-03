using System.ComponentModel.DataAnnotations;
using JobTracker.Api.Dtos;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api")]
public class InterviewsController(IInterviewService service) : ControllerBase
{
    [HttpGet("applications/{applicationId:int}/interviews")]
    public async Task<ActionResult<List<InterviewDto>>> GetAll(int applicationId, CancellationToken ct)
    {
        var result = await service.GetAsync(applicationId, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("applications/{applicationId:int}/interviews")]
    public async Task<ActionResult<InterviewDto>> Create(int applicationId, SaveInterviewDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(applicationId, dto, ct);
        return created is null ? NotFound() : StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPut("applications/{applicationId:int}/interviews/{id:int}")]
    public async Task<ActionResult<InterviewDto>> Update(int applicationId, int id, SaveInterviewDto dto, CancellationToken ct)
    {
        var result = await service.UpdateAsync(applicationId, id, dto, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("applications/{applicationId:int}/interviews/{id:int}")]
    public async Task<IActionResult> Delete(int applicationId, int id, CancellationToken ct) =>
        await service.DeleteAsync(applicationId, id, ct) ? NoContent() : NotFound();

    [HttpGet("interviews/upcoming")]
    public async Task<ActionResult<List<UpcomingInterviewDto>>> Upcoming(
        [FromQuery, Range(1, 60)] int days = 7, CancellationToken ct = default) =>
        Ok(await service.GetUpcomingAsync(days, ct));
}