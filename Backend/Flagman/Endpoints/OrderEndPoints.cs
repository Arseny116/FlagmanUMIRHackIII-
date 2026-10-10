namespace Flagman.Endpoints
{
    public static class OrderEndPoints
    {

        public static IEndpointRouteBuilder MapOrderEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var order = endpoints.MapGroup("/api/orders");

            order.MapPost('/',async (OrderRequest request, IOrderService service, CancellationToken cancellationToken) =>
            {
                var result = await service.CreateAsync(request, cancellationToken);
                return result.IsSuccess
                    ? Results.Created($"/api/orders/{result.Value!.Id}", ToResponse(result.Value))
                    : Results.BadRequest(new { error = result.Error });
            });
            return endpoints;
        }


    }
}
