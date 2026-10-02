using System;
namespace JobTracker.Api.Models
{
    public enum Stage
    {
        Applied,
        Interview,
        Offer,
        Rejected
    }

    public class JobApplication
    {

        public int Id { get; set; }
        public string Company { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Link { get; set; }
        public Stage Stage { get; set; }
        public DateTime AppliedDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


    }
}