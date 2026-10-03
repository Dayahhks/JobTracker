using System.ComponentModel.DataAnnotations;
using JobTracker.Api.Models;

namespace JobTracker.Api.Dtos;

public class ApplicationQuery
{
    [MaxLength(100)] public string? Search { get; set; }
    public Stage? Stage { get; set; }
    public string SortBy { get; set; } = "appliedDate";
    public string SortDir { get; set; } = "desc";
    [Range(1, int.MaxValue)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 10;
}