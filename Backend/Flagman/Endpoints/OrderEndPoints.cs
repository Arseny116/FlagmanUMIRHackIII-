using CSharpFunctionalExtensions;
using Flagman.Application.Abstractions.Services;
using Flagman.Domain.Abstractions;
using Flagman.Domain.Model.Order;

namespace Flagman.Endpoints;

public static class OrderEndpoints
{
    public static RouteGroupBuilder MapOrderEndpoints(this RouteGroupBuilder api)
    {
        var orders = api.MapGroup("/orders").WithTags("Orders");

        orders.MapPost("/", async (
            CreateOrderRequest request,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            Result<Order, Error> result = await service.CreateAsync(request, cancellationToken);

            if (result.IsSuccess)
            {
                return Results.Created(
                    $"/api/orders/{result.Value.Id}",
                    ToResponse(result.Value));
            }

            return result.Error.Type switch
            {
                ErrorType.NotFound => Results.NotFound(new { error = result.Error.Description }),
                ErrorType.Conflict => Results.Conflict(new
                {
                    error = result.Error.Description,
                    shortages = result.Error.Details
                }),
                _ => Results.BadRequest(new
                {
                    error = result.Error.Description,
                    details = result.Error.Details
                })
            };
        });

        return api;
    }

    private static object ToResponse(Order order) => new
    {
        order.Id,
        order.CreatedAt,
        order.Status,
        Items = order.Items.Select(item => new
        {
            item.Id,
            item.DishId,
            item.Quantity
        })
    };
}
