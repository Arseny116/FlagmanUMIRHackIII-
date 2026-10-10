using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Flagman.Domain.Abstractions;

public sealed class Result<T>
{
    private readonly T? _value;
    private readonly Error? _error;

    private Result(T? value, Error? error, bool isSuccess)
    {
        _value = value;
        _error = error;
        IsSuccess = isSuccess;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Нельзя получить значение неуспешного результата.");

    public Error Error => IsFailure
        ? _error!
        : throw new InvalidOperationException("У успешного результата нет ошибки.");

    public static Result<T> Success(T value) => new(value, null, true);
    public static Result<T> Failure(Error error) => new(default, error, false);

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);
}
