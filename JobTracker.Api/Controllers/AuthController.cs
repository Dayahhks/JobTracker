using JobTracker.Api.Dtos;
using JobTracker.Api.Models;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(UserManager<ApplicationUser> userManager, ITokenService tokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim();
        var user = new ApplicationUser { UserName = email, Email = email };

        var result = await userManager.CreateAsync(user, dto.Password);

        if (result.Succeeded)
            return StatusCode(StatusCodes.Status201Created, new { user.Id, user.Email });

        if (result.Errors.Any(e => e.Code is "DuplicateUserName" or "DuplicateEmail"))
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "An account with this email already exists.");

        foreach (var error in result.Errors)
            ModelState.AddModelError(error.Code, error.Description);
        return ValidationProblem(ModelState);
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = dto.Email.Trim();
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || !await userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized(new { Message = "Invalid email or password." });
        var (token, expiresAt) = tokenService.CreateToken(user);
        return Ok(new LoginResponseDto(token, expiresAt, user.Email!));
    }
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()=>Ok(new
    {
        UserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
        Email = User.FindFirstValue(ClaimTypes.Email)

    }); 
}