namespace Flagman.Application.Common;

public sealed class ServiceResult<T>
{
    public bool IsSuccess { get; }
    public bool IsNotFound { get; }
    public string? ErrorMessage { get; }
    public T? Value { get; }

    private ServiceResult(T? value, bool isSuccess, bool isNotFound, string? errorMessage)
    {
        Value = value;
        IsSuccess = isSuccess;
        IsNotFound = isNotFound;
        ErrorMessage = errorMessage;
    }

    public static ServiceResult<T> Success(T value) => new(value, true, false, null);

    public static ServiceResult<T> Failure(string error) => new(default, false, false, error);

    public static ServiceResult<T> NotFound(string error) => new(default, false, true, error);
}
