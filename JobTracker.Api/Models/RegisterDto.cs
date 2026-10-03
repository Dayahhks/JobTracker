using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.Dtos;

public class RegisterDto
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = "";

    [Required, MinLength(8), MaxLength(100)]
    public string Password { get; set; } = "";
}