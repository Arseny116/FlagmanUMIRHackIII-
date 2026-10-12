using Flagman.Domain.Abstractions;

namespace Flagman.Extensions;

public static class ResultExtensions
{
    public static IResult ToHttpResult<T>(this Result<T> result, Func<T, IResult> onSuccess) =>
        result.IsSuccess ? onSuccess(result.Value) : result.Error.ToProblem();

    public static IResult ToProblem(this Error error)
    {
        var extensions = new Dictionary<string, object?> { ["code"] = error.Code };

        return error.Type switch
        {
            ErrorType.Validation => Results.ValidationProblem(
                error.Details?.ToDictionary(kv => kv.Key, kv => kv.Value) ?? new Dictionary<string, string[]>(),
                detail: error.Description,
                title: "Ошибка валидации"),

            ErrorType.NotFound => Results.Problem(
                title: "Не найдено",
                detail: error.Description,
                statusCode: StatusCodes.Status404NotFound,
                extensions: extensions),

            ErrorType.Conflict => Results.Problem(
                title: "Конфликт",
                detail: error.Description,
                statusCode: StatusCodes.Status409Conflict,
                extensions: extensions),

            _ => Results.Problem(
                title: "Внутренняя ошибка",
                detail: error.Description,
                statusCode: StatusCodes.Status500InternalServerError,
                extensions: extensions)
        };
    }
}
