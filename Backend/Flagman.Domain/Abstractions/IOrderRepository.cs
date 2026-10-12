using Flagman.Domain.Model.Order;

namespace Flagman.Domain.Abstractions;

public interface IOrderRepository
{
    void Add(Order order);
    void AddConsumption(OrderBatchConsumption consumption);
}