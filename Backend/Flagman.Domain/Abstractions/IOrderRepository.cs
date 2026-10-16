using Flagman.Domain.Model.Order;

namespace Flagman.Domain.Abstractions;

public interface IOrderRepository
{
    public void Add(Order order);
    public void AddConsumption(OrderBatchConsumption consumption);

    Task<List<Order>> GetAllAsync(CancellationToken cancellationToken = default);
}