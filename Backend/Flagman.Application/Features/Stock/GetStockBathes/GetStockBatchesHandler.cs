using Flagman.Application.Abstractions;
using Flagman.Domain.Abstractions;

namespace Flagman.Application.Features.Stock.GetStockBathes;

internal sealed class GetStockBatchesHandler(IBatchRepository batches, TimeProvider clock)
    : IQueryHandler<GetStockBatchesQuery, IReadOnlyList<BatchStockResponse>>
{
    public async Task<Result<IReadOnlyList<BatchStockResponse>>> HandleAsync(
        GetStockBatchesQuery query,
        CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        var inStock = await batches.GetInStockAsync(query.ProductId, cancellationToken);

        IReadOnlyList<BatchStockResponse> items = inStock
            .Where(b => query.IncludeExpired || !b.IsExpired(now))
            .Select(b => new BatchStockResponse(
                b.Id,
                b.SupplyId,
                b.Supply.Number,
                b.ProductId,
                b.Product.Name,
                b.Product.Unit,
                b.InitialQuantity.Value,
                b.RemainingQuantity.Value,
                b.ReceivedAt,
                b.ExpiresAt,
                Math.Round(b.TimeLeft(now).TotalHours, 2),
                b.IsExpired(now)))
            .ToList();

        return Result<IReadOnlyList<BatchStockResponse>>.Success(items);
    }
}
