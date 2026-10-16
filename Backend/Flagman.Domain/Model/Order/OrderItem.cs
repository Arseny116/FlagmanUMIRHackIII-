using Flagman.Domain.Abstractions;
using Flagman.Domain.Model.Dish;
using System.Text.Json.Serialization;
namespace Flagman.Domain.Model.Order;

public sealed class OrderItem : Entity
{
    private OrderItem()
    {
        Order = default!;
        Dish = default!;
    }

    private OrderItem(Guid id, Guid orderId, Guid dishId, decimal quantity)
    {
        Id = id;
        OrderId = orderId;
        DishId = dishId;
        Quantity = quantity;
    }

    public Guid OrderId { get; private set; }

    [JsonIgnore]
    public Order Order { get; private set; }

    public Guid DishId { get; private set; }
    public Dish.Dish Dish { get; private set; }

    public decimal Quantity { get; private set; }

    internal static OrderItem Create(Guid orderId, Guid dishId, decimal quantity)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(orderId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(dishId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(quantity, 0);

        return new OrderItem(Guid.NewGuid(), orderId, dishId, quantity);
    }

    internal void IncreaseQuantity(decimal quantity)
    {
        ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(quantity, 0);
        Quantity += quantity;
    }
}
