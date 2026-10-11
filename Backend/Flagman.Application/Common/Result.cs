namespace Flagman.Application.Common;

public sealed record ServiceResult<T>(
    T? Value,
    string? Error = null,
    bool IsNotFound = false)
{
    public bool IsSuccess => Error is null && !IsNotFound;

    public static ServiceResult<T> Success(T value) => new(value);

    public static ServiceResult<T> Failure(string error) => new(default, error);

    public static ServiceResult<T> NotFound(string error) => new(default, error, true);
}
