using Flagman.Domain.Model;

namespace Flagman.Application.Features.Supplies;

public sealed record SupplyResponse(
    Guid Id,
    string Number,
    DateTimeOffset CreatedAt,
    IReadOnlyList<SupplyBatchResponse> Batches);

public sealed record SupplyBatchResponse(
    Guid BatchId,
    Guid ProductId,
    string ProductName,
    string Unit,
    decimal Quantity,
    int ShelfLifeHours,
    DateTimeOffset ExpiresAt);

internal static class SupplyMapping
{
    public static SupplyResponse ToResponse(this Supply supply) =>
        new(
            supply.Id,
            supply.Number,
            supply.CreatedAt,
            supply.Batches
                .Select(b => new SupplyBatchResponse(
                    b.Id,
                    b.ProductId,
                    b.Product.Name,
                    b.Product.Unit,
                    b.InitialQuantity.Value,
                    b.ShelfLife.Hours,
                    b.ExpiresAt))
                .ToList());
}
