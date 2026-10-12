using Flagman.Domain.Model;

namespace Flagman.Domain.Abstractions;

public interface IBatchRepository
{
    /// <summary>
    /// Партии с ненулевым остатком (с продуктом и поставкой).
    /// Порядок — FEFO: сначала с ближайшим сроком годности.
    /// </summary>
    Task<IReadOnlyList<Batch>> GetInStockAsync(Guid? productId, CancellationToken cancellationToken);
    Task<List<Batch>> GetAllAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<Batch>> GetInStockForUpdateAsync(
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken = default);
}
