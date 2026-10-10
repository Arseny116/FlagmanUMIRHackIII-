using Flagman.Application.Abstractions.Services;
using Flagman.Domain.Model;

namespace Flagman.Endpoints;

public static class RecipeItemEndpoints
{
    public static IEndpointRouteBuilder MapRecipeItemEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var recipeItems = endpoints.MapGroup("/api/recipe-items");

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
                    ? Results.NotFound(new { error = result.ErrorMessage })
                    : Results.BadRequest(new { error = result.ErrorMessage });
        });

        recipeItems.MapDelete("/{id:guid}", async (
            Guid id,
            IRecipeItemService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.DeleteAsync(id, cancellationToken);
            return result.IsSuccess
                ? Results.NoContent()
                : Results.NotFound(new { error = result.ErrorMessage });
        });

        var dishes = endpoints.MapGroup("/api/dishes");

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
                    ? Results.NotFound(new { error = result.ErrorMessage })
                    : Results.BadRequest(new { error = result.ErrorMessage });
        });

        return endpoints;
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
