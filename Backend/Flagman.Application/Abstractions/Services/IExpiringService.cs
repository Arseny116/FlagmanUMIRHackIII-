using Flagman.Domain.Model;

namespace Flagman.Application.Abstractions.Services
{
    public interface IExpiringService
    {
        Task<List<Batch>> GetAllAsync(CancellationToken cancellationToken = default);
    }
}
