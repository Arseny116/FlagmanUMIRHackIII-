using Flagman.Domain.Model;

namespace Flagman.Domain.Abstractions;

public interface IProductRepository
{
    /// <summary>Возвращает отслеживаемые продукты по списку id. Несуществующие id пропускаются.</summary>
    Task<IReadOnlyList<Product>> GetByIdsAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken);
}
