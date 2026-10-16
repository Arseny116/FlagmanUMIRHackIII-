using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;
using Flagman.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Flagman.Infrastructure.Repositories;

internal sealed class ProductRepository(AppDbContext db) : IProductRepository
{
    public async Task<IReadOnlyList<Product>> GetByIdsAsync(
        IReadOnlyCollection<Guid> ids,
        CancellationToken cancellationToken)
    {
        var idArray = ids.ToArray();
        return await db.Products
            .Where(p => idArray.Contains(p.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Product>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await db.Products
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public void Add(Product product) => db.Products.Add(product);
}
