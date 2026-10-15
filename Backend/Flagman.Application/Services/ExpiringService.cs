using Flagman.Application.Abstractions.Services;
using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;

namespace Flagman.Application.Services;

public sealed class ExpiringService(IBatchRepository batchRepository) : IExpiringService
{
    public Task<List<Batch>> GetAllAsync(CancellationToken cancellationToken = default) =>
        batchRepository.GetAllAsync(cancellationToken);
}