namespace Flagman.Application.Features.Stock;

/// <summary>Остаток продукта по всем партиям.</summary>
/// <param name="TotalQuantity">Всё, что физически лежит на складе (включая просрочку).</param>
/// <param name="AvailableQuantity">Годное к использованию.</param>
/// <param name="ExpiredQuantity">Просроченное, ещё не списанное.</param>
/// <param name="NearestExpiresAt">Ближайший срок истечения среди годных партий.</param>
public sealed record StockItemResponse(
    Guid ProductId,
    string Name,
    string Unit,
    decimal TotalQuantity,
    decimal AvailableQuantity,
    decimal ExpiredQuantity,
    int BatchCount,
    DateTimeOffset? NearestExpiresAt);

/// <summary>Остаток по конкретной партии.</summary>
/// <param name="RemainingHours">Сколько часов хранения осталось (отрицательное — просрочена).</param>
public sealed record BatchStockResponse(
    Guid BatchId,
    Guid SupplyId,
    string SupplyNumber,
    Guid ProductId,
    string ProductName,
    string Unit,
    decimal InitialQuantity,
    decimal RemainingQuantity,
    DateTimeOffset ReceivedAt,
    DateTimeOffset ExpiresAt,
    double RemainingHours,
    bool IsExpired);
