using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.Dtos;

public class SaveNoteDto
{
    [Required, MaxLength(2000)] public string Text { get; set; } = "";
}

public record NoteDto(int Id, string Text, DateTime CreatedAt, DateTime UpdatedAt);