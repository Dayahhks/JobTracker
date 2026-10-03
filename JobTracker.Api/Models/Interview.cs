namespace JobTracker.Api.Models;

public class Interview
{
    public int Id { get; set; }
    public int JobApplicationId { get; set; }
    public JobApplication? JobApplication { get; set; }
    public DateTime ScheduledAt { get; set; }
    public InterviewType Type { get; set; }
    public string? LocationOrLink { get; set; }
    public InterviewOutcome Outcome { get; set; } = InterviewOutcome.Pending;
}