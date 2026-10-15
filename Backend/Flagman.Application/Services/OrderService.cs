using CSharpFunctionalExtensions;
using Flagman.Application.Abstractions.Services;
using Flagman.Domain.Abstractions;
using Flagman.Domain.Model.Dish;
using Flagman.Domain.Model.Order;
using Flagman.Domain.ValueObjects;

namespace Flagman.Application.Services;

public sealed class OrderService(
    IDishRepository dishRepository,
    IBatchRepository batchRepository,
    IOrderRepository orderRepository,
    IUnitOfWork unitOfWork) : IOrderService
{
    public async Task<Result<Order, Error>> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Items is null || request.Items.Count == 0)
        {
            return Result.Failure<Order, Error>(ValidationError(
                "Order must contain at least one dish."));
        }

        if (request.Items.Any(item =>
                item.DishId == Guid.Empty || item.Quantity <= 0))
        {
            return Result.Failure<Order, Error>(ValidationError(
                "Each order item must contain a dish and a positive quantity."));
        }

        var requestedDishes = request.Items
            .GroupBy(item => item.DishId)
            .ToDictionary(group => group.Key, group => group.Sum(item => item.Quantity));

        var dishes = new Dictionary<Guid, Dish>();
        foreach (var dishId in requestedDishes.Keys)
        {
            var dish = await dishRepository.GetByIdAsync(dishId, cancellationToken);
            if (dish is null)
            {
                return Result.Failure<Order, Error>(Error.NotFound(
                    "DishNotFound",
                    $"Dish '{dishId}' was not found."));
            }

            dishes[dishId] = dish;
        }

        var requiredProducts = new Dictionary<Guid, decimal>();
        foreach (var (dishId, dishQuantity) in requestedDishes)
        {
            foreach (var recipeItem in dishes[dishId].RecipeItems)
            {
                requiredProducts.TryGetValue(recipeItem.ProductId, out var currentQuantity);
                requiredProducts[recipeItem.ProductId] =
                    currentQuantity + recipeItem.Quantity * dishQuantity;
            }
        }

        if (requiredProducts.Count == 0)
        {
            return Result.Failure<Order, Error>(ValidationError(
                "At least one selected dish must contain recipe items."));
        }

        await using var transaction =
            await unitOfWork.BeginTransactionAsync(cancellationToken);

        var batches = await batchRepository.GetInStockForUpdateAsync(
            requiredProducts.Keys.ToArray(),
            cancellationToken);

        var shortages = requiredProducts
            .Select(required =>
            {
                var available = batches
                    .Where(batch => batch.ProductId == required.Key)
                    .Sum(batch => batch.RemainingQuantity.Value);

                return new
                {
                    ProductId = required.Key,
                    Required = required.Value,
                    Available = available,
                    Missing = Math.Max(required.Value - available, 0)
                };
            })
            .Where(shortage => shortage.Missing > 0)
            .ToArray();

        if (shortages.Length > 0)
        {
            await transaction.RollbackAsync(cancellationToken);

            var details = shortages.ToDictionary(
                shortage => shortage.ProductId.ToString(),
                shortage => new[]
                {
                    $"Required: {shortage.Required}; " +
                    $"available: {shortage.Available}; " +
                    $"missing: {shortage.Missing}."
                });

            return Result.Failure<Order, Error>(Error.Conflict(
                "InsufficientProducts",
                "Not enough products to complete the order.") with
            {
                Details = details
            });
        }

        var order = Order.Create();
        foreach (var (dishId, quantity) in requestedDishes)
        {
            order.AddItem(dishId, quantity);
        }

        foreach (var required in requiredProducts)
        {
            var remainingToConsume = required.Value;
            var productBatches = batches
                .Where(batch => batch.ProductId == required.Key)
                .OrderBy(batch => batch.ExpiresAt)
                .ThenBy(batch => batch.ReceivedAt);

            foreach (var batch in productBatches)
            {
                if (remainingToConsume <= 0)
                {
                    break;
                }

                var amount = Math.Min(
                    remainingToConsume,
                    batch.RemainingQuantity.Value);

                if (amount <= 0)
                {
                    continue;
                }

                batch.Consume(Quantity.From(amount));
                orderRepository.AddConsumption(
                    OrderBatchConsumption.Create(
                        order.Id,
                        batch.Id,
                        required.Key,
                        amount));

                remainingToConsume -= amount;
            }
        }

        order.Complete();
        orderRepository.Add(order);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Result.Success<Order, Error>(order);
    }

 

    private static Error ValidationError(string message) =>
        Error.Validation(new Dictionary<string, string[]>
        {
            ["Order"] = new[] { message }
        });

    public Task<List<Order>> GetAllAsync(CancellationToken cancellationToken = default) =>
        orderRepository.GetAllAsync(cancellationToken);
}
