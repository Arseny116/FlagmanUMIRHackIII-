using Flagman.Application.Abstractions.Services;
using Flagman.Domain.Model.Dish;

namespace Flagman.Endpoints;

public static class RecipeItemEndpoints
{
    public static RouteGroupBuilder MapRecipeItemEndpoints(this RouteGroupBuilder api)
    {
        var recipeItems = api.MapGroup("/recipe-items").WithTags("Recipe Items");

        recipeItems.MapGet("/", async (
            IRecipeItemService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.GetAllAsync(cancellationToken);
            return Results.Ok(result.Select(ToResponse));
        });

        recipeItems.MapGet("/{id:guid}", async (
            Guid id,
            IRecipeItemService service,
            CancellationToken cancellationToken) =>
        {
            var item = await service.GetByIdAsync(id, cancellationToken);
            return item is null
                ? Results.NotFound()
                : Results.Ok(ToResponse(item));
        });

        recipeItems.MapPut("/{id:guid}", async (
            Guid id,
            RecipeItemRequest request,
            IRecipeItemService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.UpdateAsync(
                id,
                request.DishId,
                request.ProductId,
                request.Quantity,
                cancellationToken);

            return result.IsSuccess
                ? Results.NoContent()
                : result.IsNotFound
                    ? Results.NotFound(new { error = result.Error })
                    : Results.BadRequest(new { error = result.Error });
        });

        recipeItems.MapDelete("/{id:guid}", async (
            Guid id,
            IRecipeItemService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.DeleteAsync(id, cancellationToken);
            return result.IsSuccess
                ? Results.NoContent()
                : Results.NotFound(new { error = result.Error });
        });

        var dishes = api.MapGroup("/dishes").WithTags("Dishes");

        dishes.MapGet("/{dishId:guid}/recipe-items", async (
            Guid dishId,
            IRecipeItemService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.GetByDishIdAsync(dishId, cancellationToken);
            return Results.Ok(result.Select(ToResponse));
        });

        dishes.MapPost("/{dishId:guid}/recipe-items", async (
            Guid dishId,
            RecipeItemRequest request,
            IRecipeItemService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.CreateAsync(
                dishId,
                request.ProductId,
                request.Quantity,
                cancellationToken);

            return result.IsSuccess
                ? Results.Created($"/api/recipe-items/{result.Value!.Id}", ToResponse(result.Value))
                : result.IsNotFound
                    ? Results.NotFound(new { error = result.Error })
                    : Results.BadRequest(new { error = result.Error });
        });

        return api;
    }

    internal static object ToResponse(RecipeItem item) => new
    {
        item.Id,
        item.DishId,
        item.ProductId,
        item.Quantity,
        ProductName = item.Product?.Name
    };
}

public sealed record RecipeItemRequest(Guid DishId, Guid ProductId, decimal Quantity);
