using System.ComponentModel.DataAnnotations;
using JobTracker.Api.Models;

namespace JobTracker.Api.Dtos;

public class SaveInterviewDto
{
    [Required] public DateTime? ScheduledAt { get; set; }
    public InterviewType Type { get; set; }
    [MaxLength(500)] public string? LocationOrLink { get; set; }
    public InterviewOutcome Outcome { get; set; } = InterviewOutcome.Pending;
}

public record InterviewDto(int Id, int ApplicationId, DateTime ScheduledAt, InterviewType Type,
    string? LocationOrLink, InterviewOutcome Outcome);

public record UpcomingInterviewDto(int Id, int ApplicationId, string Company, string Title,
    DateTime ScheduledAt, InterviewType Type, string? LocationOrLink);