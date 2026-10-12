using Flagman.Domain.Abstractions;

namespace Flagman.Domain.Model.Order;

public sealed class Order : Entity
{
    private readonly List<OrderItem> _items = new();

    private Order()
    {
    }

    private Order(Guid id, DateTimeOffset createdAt)
    {
        Id = id;
        CreatedAt = createdAt.ToUniversalTime();
        Status = OrderStatus.Created;
    }

    public DateTimeOffset CreatedAt { get; private set; }

    public OrderStatus Status { get; private set; }

    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    public static Order Create(DateTimeOffset? createdAt = null)
    {
        return new Order(Guid.NewGuid(), createdAt ?? DateTimeOffset.UtcNow);
    }

    public OrderItem AddItem(Guid dishId, decimal quantity)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(dishId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(quantity, 0);

        var existingItem = _items.FirstOrDefault(item => item.DishId == dishId);
        if (existingItem is not null)
        {
            existingItem.IncreaseQuantity(quantity);
            return existingItem;
        }

        var item = OrderItem.Create(Id, dishId, quantity);
        _items.Add(item);
        return item;
    }

    public void Complete()
    {
        Status = OrderStatus.Completed;
    }

    public void Reject()
    {
        Status = OrderStatus.Rejected;
    }

    public void Cancel()
    {
        Status = OrderStatus.Cancelled;
    }
}
