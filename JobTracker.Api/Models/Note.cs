namespace JobTracker.Api.Models;

public class Note
{
    public int Id { get; set; }
    public int JobApplicationId { get; set; }
    public JobApplication? JobApplication { get; set; }
    public string Text { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}