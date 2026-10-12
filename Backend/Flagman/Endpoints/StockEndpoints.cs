using Flagman.Application.Abstractions;
using Flagman.Application.Features.Stock;
using Flagman.Application.Features.Stock.GetStock;
using Flagman.Application.Features.Stock.GetStockBathes;
using Flagman.Extensions;

namespace Flagman.Endpoints;

internal static class StockEndpoints
{
    public static RouteGroupBuilder MapStockEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/stock").WithTags("Stock");

        group.MapGet("", async (
                IQueryHandler<GetStockQuery, IReadOnlyList<StockItemResponse>> handler,
                CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new GetStockQuery(), ct);
            return result.ToHttpResult(Results.Ok);
        })
            .WithSummary("Общие остатки по продуктам")
            .Produces<IReadOnlyList<StockItemResponse>>();

        group.MapGet("/batches", async (
                Guid? productId,
                bool? includeExpired,
                IQueryHandler<GetStockBatchesQuery, IReadOnlyList<BatchStockResponse>> handler,
                CancellationToken ct) =>
        {
            var query = new GetStockBatchesQuery(productId, includeExpired ?? true);
            var result = await handler.HandleAsync(query, ct);
            return result.ToHttpResult(Results.Ok);
        })
            .WithSummary("Остатки по партиям с оставшимся сроком хранения (порядок FEFO)")
            .Produces<IReadOnlyList<BatchStockResponse>>();

        return api;
    }
}
