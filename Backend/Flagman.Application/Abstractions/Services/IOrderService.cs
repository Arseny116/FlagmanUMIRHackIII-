using CSharpFunctionalExtensions;
using Flagman.Domain.Abstractions;
using Flagman.Domain.Model.Order;

namespace Flagman.Application.Abstractions.Services;

public interface IOrderService
{
    Task<Result<Order, Error>> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default);
}

public sealed record CreateOrderRequest(IReadOnlyList<OrderDishRequest>? Items);

public sealed record OrderDishRequest(Guid DishId, decimal Quantity);
