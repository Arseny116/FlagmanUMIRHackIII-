using Flagman.Application.Abstractions;
using Flagman.Domain.Abstractions;
namespace Flagman.Application.Features.Supplies.GetSupply;

internal sealed class GetSupplyHandler(ISupplyRepository supplies)
    : IQueryHandler<GetSupplyQuery, SupplyResponse>
{
    public async Task<Result<SupplyResponse>> HandleAsync(GetSupplyQuery query, CancellationToken cancellationToken)
    {
        var supply = await supplies.GetByIdAsync(query.Id, cancellationToken);

        return supply is null
            ? Error.NotFound("Supply.NotFound", $"Поставка с id {query.Id} не найдена.")
            : supply.ToResponse();
    }
}
