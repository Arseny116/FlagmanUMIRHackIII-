using Flagman.Domain.Abstractions;
using Flagman.Domain.Model.Order;
using Flagman.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Flagman.Infrastructure.Repositories;

public sealed class OrderRepository(AppDbContext db) : IOrderRepository
{
    public void Add(Order order) => db.Orders.Add(order);

    public void AddConsumption(OrderBatchConsumption consumption) =>
        db.OrderBatchConsumptions.Add(consumption);

    public async Task<List<Order>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await db.Orders
            .Include(order => order.Items)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
}