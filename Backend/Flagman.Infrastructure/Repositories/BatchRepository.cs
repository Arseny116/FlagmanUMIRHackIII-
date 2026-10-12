using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;
using Flagman.Domain.ValueObjects;
using Flagman.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Flagman.Infrastructure.Repositories;

public sealed class BatchRepository(AppDbContext db) : IBatchRepository
{
    public async Task<IReadOnlyList<Batch>> GetInStockAsync(Guid? productId, CancellationToken cancellationToken)
    {
        var query = db.Batches
            .AsNoTracking()
            .Include(b => b.Product)
            .Include(b => b.Supply)
            .Where(b => b.RemainingQuantity != Quantity.Zero);

        if (productId is { } id)
            query = query.Where(b => b.ProductId == id);

        // FEFO-порядок: первым идёт партия, которая истекает раньше.
        return await query
            .OrderBy(b => b.ExpiresAt)
            .ThenBy(b => b.ReceivedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Batch>> GetAllAsync(CancellationToken cancellationToken) =>
             await db.Batches.AsNoTracking()
            .Include(b => b.Product)
            .Include(b => b.Supply)
            .OrderBy(b => b.ExpiresAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Batch>> GetInStockForUpdateAsync(
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken = default)
    {
        return await db.Batches
            .Include(b => b.Product)
            .Include(b => b.Supply)
            .Where(b => productIds.Contains(b.ProductId))
            .Where(b => b.RemainingQuantity != Quantity.Zero)
            .OrderBy(b => b.ExpiresAt)
            .ThenBy(b => b.ReceivedAt)
            .ToListAsync(cancellationToken);
    }

}
