namespace Flagman.Endpoints;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api");

        api.MapDishEndpoints();
        api.MapRecipeItemEndpoints();
        api.MapOrderEndpoints();
        api.MapProductEndpoints();
        api.MapSupplyEndpoints();
        api.MapStockEndpoints();

        return app;
    }
}
