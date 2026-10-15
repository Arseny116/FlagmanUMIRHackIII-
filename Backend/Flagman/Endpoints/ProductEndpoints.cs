using Flagman.Application.Abstractions;
using Flagman.Domain.Model;

namespace Flagman.Endpoints;

public static class ProductEndpoints
{
    public static RouteGroupBuilder MapProductEndpoints(this RouteGroupBuilder api)
    {
        var products = api.MapGroup("/products").WithTags("Products");

        products.MapGet("", async (
            IProductService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.GetAllAsync(cancellationToken);
            return Results.Ok(result.Select(ToResponse));
        })
            .WithSummary("Получить все продукты")
            .Produces<IEnumerable<object>>();

        products.MapPost("", async (
            CreateProductRequest request,
            IProductService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var product = await service.CreateAsync(
                    request.Name,
                    request.Unit,
                    cancellationToken);

                return Results.Created($"/api/products/{product.Id}", ToResponse(product));
            }
            catch (ArgumentException exception)
            {
                return Results.BadRequest(new { error = exception.Message });
            }
        })
            .WithSummary("Создать продукт")
            .Produces<object>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        return api;
    }

    private static object ToResponse(Product product) => new
    {
        product.Id,
        product.Name,
        product.Unit
    };
}

public sealed record CreateProductRequest(string Name, string Unit);
