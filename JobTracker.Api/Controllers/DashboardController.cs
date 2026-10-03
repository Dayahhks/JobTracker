using JobTracker.Api.Dtos;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController(IDashboardService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get(CancellationToken ct) =>
        Ok(await service.GetAsync(ct));
}