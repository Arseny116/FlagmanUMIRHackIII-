namespace Flagman.Application.Features.Stock.GetStockBathes;

/// <param name="ProductId">Фильтр по продукту.</param>
/// <param name="IncludeExpired">Показывать ли просроченные партии.</param>
public sealed record GetStockBatchesQuery(Guid? ProductId = null, bool IncludeExpired = true);
