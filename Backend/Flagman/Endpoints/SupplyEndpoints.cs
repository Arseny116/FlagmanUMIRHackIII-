using Flagman.Application.Abstractions;
using Flagman.Application.Features.Supplies;
using Flagman.Application.Features.Supplies.CreateSupply;
using Flagman.Application.Features.Supplies.GetSupply;
using Flagman.Extensions;

namespace Flagman.Endpoints;

internal static class SupplyEndpoints
{
    public static RouteGroupBuilder MapSupplyEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/supplies").WithTags("Supplies");

        group.MapPost("", async (
                CreateSupplyCommand command,
                ICommandHandler<CreateSupplyCommand, SupplyResponse> handler,
                CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return result.ToHttpResult(supply => Results.Created($"/api/supplies/{supply.Id}", supply));
        })
            .WithSummary("Принять поставку: каждая позиция становится партией со своим сроком годности")
            .Produces<SupplyResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapGet("/{id:guid}", async (
                Guid id,
                IQueryHandler<GetSupplyQuery, SupplyResponse> handler,
                CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new GetSupplyQuery(id), ct);
            return result.ToHttpResult(Results.Ok);
        })
            .WithSummary("Получить поставку с её партиями")
            .Produces<SupplyResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        return api;
    }
}
