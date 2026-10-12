using Flagman.Domain.Abstractions;

namespace Flagman.Application.Abstractions;

public interface IQueryHandler<in TQuery, TResponse>
{
    Task<Result<TResponse, Error>> HandleAsync(TQuery query, CancellationToken cancellationToken);
}
