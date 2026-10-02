using JobTracker.Api.Dtos;
using JobTracker.Api.Models;
namespace JobTracker.Api.Services;

public interface IJobApplicationService
{
    Task<List<JobApplicationDto>> GetAllAsync(CancellationToken ct);
    Task<JobApplicationDto?> GetByIdAsync(int id, CancellationToken ct);
    Task<JobApplicationDto> CreateAsync(SaveJobApplicationDto dto, CancellationToken ct);
    Task<JobApplicationDto?> UpdateAsync(int id, SaveJobApplicationDto dto, CancellationToken ct);
    Task<JobApplicationDto?> UpdateStageAsync(int id, Stage stage, CancellationToken ct);
    Task<bool> DeleteAsync(int id, CancellationToken ct);
}

