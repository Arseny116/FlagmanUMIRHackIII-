using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Flagman.Middleware;


internal sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title, detail) = exception switch
        {
            DbUpdateException { InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } }
                => (StatusCodes.Status409Conflict, "Конфликт", "Запись с такими данными уже существует."),

            BadHttpRequestException bad
                => (bad.StatusCode, "Некорректный запрос", bad.Message),

            _ => (StatusCodes.Status500InternalServerError, "Внутренняя ошибка сервера", "Что-то пошло не так.")
        };

        if (status >= 500)
            logger.LogError(exception, "Необработанное исключение при {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(
            new ProblemDetails { Status = status, Title = title, Detail = detail },
            cancellationToken);

        return true;
    }
}
