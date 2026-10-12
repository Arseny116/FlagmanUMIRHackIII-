using Flagman.Domain.Abstractions;

namespace Flagman.Application.Abstractions;

public interface ICommandHandler<in TCommand, TResponse>
{
    Task<Result<TResponse>> HandleAsync(TCommand command, CancellationToken cancellationToken);
}
