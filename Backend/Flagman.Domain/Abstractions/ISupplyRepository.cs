using Flagman.Domain.Model;

namespace Flagman.Domain.Abstractions;

public interface ISupplyRepository
{
    void Add(Supply supply);

    Task<bool> ExistsByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<bool> ExistsByNumberAsync(string number, CancellationToken cancellationToken);

    /// <summary>Поставка вместе с партиями и продуктами.</summary>
    Task<Supply?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
}
