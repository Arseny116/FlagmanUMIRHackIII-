using Flagman.Domain.Model;

namespace Flagman.Domain.Abstractions;

public interface IDishRepository
{
    Task<IReadOnlyList<Dish>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Dish dish, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Dish dish, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}