using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;
using Flagman.Domain.Model.Dish;
using Flagman.Domain.Model.Order;
using Microsoft.EntityFrameworkCore;

namespace Flagman.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Supply> Supplies => Set<Supply>();
    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<RecipeItem> RecipeItems => Set<RecipeItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderBatchConsumption> OrderBatchConsumptions => Set<OrderBatchConsumption>();

    public async Task<IUnitOfWorkTransaction> BeginTransactionAsync(
        CancellationToken cancellationToken = default)
    {
        if (Database.IsInMemory())
            return new NoOpUnitOfWorkTransaction();

        var transaction = await Database.BeginTransactionAsync(cancellationToken);
        return new EfUnitOfWorkTransaction(transaction);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
