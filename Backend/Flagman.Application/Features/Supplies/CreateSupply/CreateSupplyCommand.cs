namespace Flagman.Application.Features.Supplies.CreateSupply;

/// <summary>
/// Тело POST /api/supplies.
/// CreatedAt необязательна: если не передана, берётся текущее время сервера.
/// </summary>
public sealed record CreateSupplyCommand(
    Guid Id,
    string? Number,
    DateTimeOffset? CreatedAt,
    IReadOnlyList<CreateSupplyItem>? Items);

/// <param name="ProductId">Идентификатор продукта.</param>
/// <param name="Name">Название продукта.</param>
/// <param name="Quantity">Количество.</param>
/// <param name="ShelfLifeHours">Срок хранения в часах.</param>
/// <param name="Unit">Единица измерения.</param>
public sealed record CreateSupplyItem(
    Guid ProductId,
    string? Name,
    decimal Quantity,
    int ShelfLifeHours,
    string? Unit);
