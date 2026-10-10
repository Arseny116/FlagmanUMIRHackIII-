namespace Flagman.Domain.Abstractions;

public enum ErrorType
{
    Failure,
    Validation,
    NotFound,
    Conflict
}

public sealed record Error(
    string Code,
    string Description,
    ErrorType Type,
    IReadOnlyDictionary<string, string[]>? Details = null)
{
    public static Error Validation(IReadOnlyDictionary<string, string[]> details) =>
        new("Validation", "Одно или несколько полей некорректны.", ErrorType.Validation, details);

    public static Error NotFound(string code, string description) =>
        new(code, description, ErrorType.NotFound);

    public static Error Conflict(string code, string description) =>
        new(code, description, ErrorType.Conflict);

    public static Error Failure(string code, string description) =>
        new(code, description, ErrorType.Failure);
}
