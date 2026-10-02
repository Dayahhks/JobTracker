using JobTracker.Api.Dtos;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;
namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/applications")]
public class JobApplicationsController(IJobApplicationService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<JobApplicationDto>>> GetAll(CancellationToken ct) =>
        Ok(await service.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<JobApplicationDto>> GetById(int id, CancellationToken ct)
    {
        var result = await service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<JobApplicationDto>> Create(SaveJobApplicationDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<JobApplicationDto>> Update(int id, SaveJobApplicationDto dto, CancellationToken ct)
    {
        var result = await service.UpdateAsync(id, dto, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id:int}/stage")]
    public async Task<ActionResult<JobApplicationDto>> UpdateStage(int id, UpdateStageDto dto, CancellationToken ct)
    {
        var result = await service.UpdateStageAsync(id, dto.Stage, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}