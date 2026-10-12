using Flagman.Application.Abstractions.Services;
using Flagman.Domain.Model.Dish;

namespace Flagman.Endpoints;

public static class DishEndpoints
{
    public static IEndpointRouteBuilder MapDishEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var dishes = endpoints.MapGroup("/api/dishes");

        dishes.MapGet("/", async (IDishService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetAllAsync(cancellationToken);
            return Results.Ok(result.Select(ToResponse));
        });

        dishes.MapGet("/{id:guid}", async (
            Guid id,
            IDishService service,
            CancellationToken cancellationToken) =>
        {
            var dish = await service.GetByIdAsync(id, cancellationToken);
            return dish is null
                ? Results.NotFound()
                : Results.Ok(ToResponse(dish));
        });

        dishes.MapPost("/", async (
            DishRequest request,
            IDishService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.CreateAsync(request.Name, cancellationToken);
            return result.IsSuccess
                ? Results.Created($"/api/dishes/{result.Value!.Id}", ToResponse(result.Value))
                : Results.BadRequest(new { error = result.Error });
        });

        dishes.MapPut("/{id:guid}", async (
            Guid id,
            DishRequest request,
            IDishService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.UpdateAsync(id, request.Name, cancellationToken);
            return result.IsSuccess
                ? Results.NoContent()
                : result.IsNotFound
                    ? Results.NotFound(new { error = result.Error })
                    : Results.BadRequest(new { error = result.Error });
        });

        dishes.MapDelete("/{id:guid}", async (
            Guid id,
            IDishService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.DeleteAsync(id, cancellationToken);
            return result.IsSuccess
                ? Results.NoContent()
                : Results.NotFound(new { error = result.Error });
        });

        return endpoints;
    }

    internal static object ToResponse(Dish dish) => new
    {
        dish.Id,
        dish.Name,
        RecipeItems = dish.RecipeItems.Select(RecipeItemEndpoints.ToResponse)
    };
}

public sealed record DishRequest(string Name);
