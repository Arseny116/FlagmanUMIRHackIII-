using Flagman.Application.Abstractions.Services;
using Flagman.Application.Features.Stock;
using Flagman.Domain.Model;

namespace Flagman.Endpoints
{
    public static class Expiring
    {
        public static RouteGroupBuilder MapExpiringEndpoints(this RouteGroupBuilder api)
        {
            var expiring = api.MapGroup("/expiring").WithTags("Expiring");
            expiring.MapGet("/", async (IExpiringService service, CancellationToken cancellationToken) =>
            {
                var result = await service.GetAllAsync(cancellationToken);
                return Results.Ok(result.Select(ToResponse));
            })
                .WithName("GetExpiring")
                .WithSummary("Получить список продуктов с истекающим сроком годности")
                .Produces(StatusCodes.Status200OK);
            return expiring;
        }

        private static BatchStockResponse ToResponse(Batch batch)
        {
            var now = DateTimeOffset.UtcNow;

            return new BatchStockResponse(
                batch.Id,
                batch.SupplyId,
                batch.Supply.Number,
                batch.ProductId,
                batch.Product.Name,
                batch.Product.Unit,
                batch.InitialQuantity.Value,
                batch.RemainingQuantity.Value,
                batch.ReceivedAt,
                batch.ExpiresAt,
                batch.TimeLeft(now).TotalHours,
                batch.IsExpired(now));
        }
    }
}
