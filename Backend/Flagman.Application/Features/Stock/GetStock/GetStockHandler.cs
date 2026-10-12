using CSharpFunctionalExtensions;
using Flagman.Application.Abstractions;
using Flagman.Domain.Abstractions;

namespace Flagman.Application.Features.Stock.GetStock;

internal sealed class GetStockHandler(IBatchRepository batches, TimeProvider clock)
    : IQueryHandler<GetStockQuery, IReadOnlyList<StockItemResponse>>
{
    public async Task<Result<IReadOnlyList<StockItemResponse>, Error>> HandleAsync(
        GetStockQuery query,
        CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        var inStock = await batches.GetInStockAsync(null, cancellationToken);

        IReadOnlyList<StockItemResponse> items = inStock
            .GroupBy(b => b.ProductId)
            .Select(group =>
            {
                var product = group.First().Product;
                var fresh = group.Where(b => !b.IsExpired(now)).ToList();
                var expired = group.Where(b => b.IsExpired(now)).ToList();

                return new StockItemResponse(
                    product.Id,
                    product.Name,
                    product.Unit,
                    group.Sum(b => b.RemainingQuantity.Value),
                    fresh.Sum(b => b.RemainingQuantity.Value),
                    expired.Sum(b => b.RemainingQuantity.Value),
                    group.Count(),
                    fresh.Count > 0 ? fresh.Min(b => b.ExpiresAt) : (DateTimeOffset?)null);
            })
            .OrderBy(i => i.Name)
            .ToList();

        return Result.Success<IReadOnlyList<StockItemResponse>, Error>(items);
    }
}
