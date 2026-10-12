using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;
using Flagman.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Flagman.Infrastructure.Repositories;

internal sealed class SupplyRepository(AppDbContext db) : ISupplyRepository
{
    public void Add(Supply supply) => db.Supplies.Add(supply);

    public Task<bool> ExistsByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.Supplies.AnyAsync(s => s.Id == id, cancellationToken);

    public Task<bool> ExistsByNumberAsync(string number, CancellationToken cancellationToken) =>
        db.Supplies.AnyAsync(s => s.Number == number, cancellationToken);

    public Task<Supply?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.Supplies
            .AsNoTracking()
            .Include(s => s.Batches)
                .ThenInclude(b => b.Product)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
}
