using Flagman.Domain.Abstractions;
using Microsoft.EntityFrameworkCore.Storage;

namespace Flagman.Infrastructure.Persistence;

internal sealed class EfUnitOfWorkTransaction(IDbContextTransaction transaction)
    : IUnitOfWorkTransaction
{
    public Task CommitAsync(CancellationToken cancellationToken = default) =>
        transaction.CommitAsync(cancellationToken);

    public Task RollbackAsync(CancellationToken cancellationToken = default) =>
        transaction.RollbackAsync(cancellationToken);

    public ValueTask DisposeAsync()
    {
        transaction.Dispose();
        return ValueTask.CompletedTask;
    }
}

internal sealed class NoOpUnitOfWorkTransaction : IUnitOfWorkTransaction
{
    public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;

    public Task RollbackAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
}