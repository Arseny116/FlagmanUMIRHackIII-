using Flagman.Application.Abstractions.Services;
using Flagman.Domain.Model.Dish;

namespace Flagman.Endpoints;

public static class DishEndpoints
{
    public static RouteGroupBuilder MapDishEndpoints(this RouteGroupBuilder api)
    {
        var dishes = api.MapGroup("/dishes").WithTags("Dishes");

        dishes.MapGet("/", async (IDishService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetAllAsync(cancellationToken);
            return Results.Ok(result.Select(ToResponse));
        })
            .WithName("GetDishes")
            .WithSummary("Получить список блюд")
            .Produces(StatusCodes.Status200OK);

        dishes.MapGet("/{id:guid}", async (
            Guid id,
            IDishService service,
            CancellationToken cancellationToken) =>
        {
            var dish = await service.GetByIdAsync(id, cancellationToken);
            return dish is null
                ? Results.NotFound()
                : Results.Ok(ToResponse(dish));
        })
            .WithName("GetDishById")
            .WithSummary("Получить блюдо по идентификатору")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        dishes.MapPost("/", async (
            DishRequest request,
            IDishService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.CreateAsync(request.Name, request.RecipeItems, cancellationToken);
            return result.IsSuccess
                ? Results.Created($"/api/dishes/{result.Value!.Id}", ToResponse(result.Value))
                : Results.BadRequest(new { error = result.Error });
        })
            .WithName("CreateDish")
            .WithSummary("Создать блюдо")
            .Accepts<DishRequest>("application/json")
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        dishes.MapPut("/{id:guid}", async (
            Guid id,
            DishRequest request,
            IDishService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.UpdateAsync(id, request.Name, request.RecipeItems, cancellationToken);
            return result.IsSuccess
                ? Results.NoContent()
                : result.IsNotFound
                    ? Results.NotFound(new { error = result.Error })
                    : Results.BadRequest(new { error = result.Error });
        })
            .WithName("UpdateDish")
            .WithSummary("Изменить блюдо")
            .Accepts<DishRequest>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        dishes.MapDelete("/{id:guid}", async (
            Guid id,
            IDishService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.DeleteAsync(id, cancellationToken);
            return result.IsSuccess
                ? Results.NoContent()
                : Results.NotFound(new { error = result.Error });
        })
            .WithName("DeleteDish")
            .WithSummary("Удалить блюдо")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        return dishes;
    }

    internal static object ToResponse(Dish dish) => new
    {
        dish.Id,
        dish.Name,
        RecipeItems = dish.RecipeItems.Select(RecipeItemEndpoints.ToResponse)
    };
}

public sealed record DishRequest(string Name, List<RecipeItem> RecipeItems);