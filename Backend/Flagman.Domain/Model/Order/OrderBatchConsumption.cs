using Flagman.Domain.Abstractions;

namespace Flagman.Domain.Model.Order;

public sealed class OrderBatchConsumption : Entity
{
    private OrderBatchConsumption()
    {
        Order = default!;
        Batch = default!;
    }

    private OrderBatchConsumption(
        Guid id,
        Guid orderId,
        Guid batchId,
        Guid productId,
        decimal quantity)
    {
        Id = id;
        OrderId = orderId;
        BatchId = batchId;
        ProductId = productId;
        Quantity = quantity;
    }

    public Guid OrderId { get; private set; }
    public Order Order { get; private set; }

    public Guid BatchId { get; private set; }
    public Batch Batch { get; private set; }

    public Guid ProductId { get; private set; }
    public decimal Quantity { get; private set; }

    public static OrderBatchConsumption Create(
        Guid orderId,
        Guid batchId,
        Guid productId,
        decimal quantity)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(orderId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(batchId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(productId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(quantity, 0);

        return new OrderBatchConsumption(
            Guid.NewGuid(),
            orderId,
            batchId,
            productId,
            quantity);
    }
}