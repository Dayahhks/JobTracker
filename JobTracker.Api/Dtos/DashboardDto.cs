namespace JobTracker.Api.Dtos;

public record WeeklyCountDto(DateOnly WeekStart, int Count);
public record SourceCountDto(string Source, int Count);

public record DashboardDto(
    int Total,
    Dictionary<string, int> ByStage,
    double InterviewRate,   // percent
    double OfferRate,       // percent
    List<WeeklyCountDto> Weekly,
    List<SourceCountDto> BySource);