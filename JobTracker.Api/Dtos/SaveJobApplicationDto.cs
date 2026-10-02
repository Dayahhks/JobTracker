using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.Dtos
{
    public class SaveJobApplicationDto
    {
        [Required, MaxLength(200)] public string Company { get; set; } = "";
        [Required, MaxLength(200)] public string Title { get; set; } = "";
        [Url] public string? Link { get; set; }
        public DateTime AppliedDate { get; set; }
    }
}
