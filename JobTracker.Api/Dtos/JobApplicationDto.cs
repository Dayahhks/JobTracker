using JobTracker.Api.Models;

namespace JobTracker.Api.Dtos;

public record JobApplicationDto(
    int Id,
    string Company,
    string Title,
    string? Link,
    Stage Stage,
    DateTime AppliedDate,
    DateTime UpdatedAt, string? Source);