using Flagman.Domain.Abstractions;
using Flagman.Domain.Model.Order;
using Flagman.Infrastructure.Persistence;

namespace Flagman.Infrastructure.Repositories;

public sealed class OrderRepository(AppDbContext db) : IOrderRepository
{
    public void Add(Order order) => db.Orders.Add(order);

    public void AddConsumption(OrderBatchConsumption consumption) =>
        db.OrderBatchConsumptions.Add(consumption);
}