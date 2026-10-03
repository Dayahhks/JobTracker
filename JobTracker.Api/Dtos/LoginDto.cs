using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.Dtos
{
    public class LoginDto
    {
        [Required, EmailAddress] public string Email { get; set; } = "";
        [Required] public string Password { get; set; } = "";
    }

    public record LoginResponseDto(string Token, DateTime ExpiresAt, string Email);
}
