using Flagman.Application.Abstractions.Services;
using Flagman.Application.Common;
using Flagman.Domain.Abstractions;
using Flagman.Domain.Model.Dish;

namespace Flagman.Application.Services;

public sealed class RecipeItemService(
    IRecipeItemRepository repository,
    IDishRepository dishRepository) : IRecipeItemService
{
    public Task<IReadOnlyList<RecipeItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return repository.GetAllAsync(cancellationToken);
    }

    public Task<RecipeItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return repository.GetByIdAsync(id, cancellationToken);
    }

    public Task<IReadOnlyList<RecipeItem>> GetByDishIdAsync(
        Guid dishId,
        CancellationToken cancellationToken = default)
    {
        return repository.GetByDishIdAsync(dishId, cancellationToken);
    }

    public async Task<ServiceResult<RecipeItem>> CreateAsync(
        Guid dishId,
        Guid productId,
        decimal quantity,
        CancellationToken cancellationToken = default)
    {
        var validationError = Validate(dishId, productId, quantity);
        if (validationError is not null)
        {
            return ServiceResult<RecipeItem>.Failure(validationError);
        }

        if (await dishRepository.GetByIdAsync(dishId, cancellationToken) is null)
        {
            return ServiceResult<RecipeItem>.NotFound("Dish was not found.");
        }

        var item = new RecipeItem
        {
            DishId = dishId,
            ProductId = productId,
            Quantity = quantity
        };

        await repository.AddAsync(item, cancellationToken);
        return ServiceResult<RecipeItem>.Success(item);
    }

    public async Task<ServiceResult<bool>> UpdateAsync(
        Guid id,
        Guid dishId,
        Guid productId,
        decimal quantity,
        CancellationToken cancellationToken = default)
    {
        var validationError = Validate(dishId, productId, quantity);
        if (validationError is not null)
        {
            return ServiceResult<bool>.Failure(validationError);
        }

        if (await dishRepository.GetByIdAsync(dishId, cancellationToken) is null)
        {
            return ServiceResult<bool>.NotFound("Dish was not found.");
        }

        var updated = await repository.UpdateAsync(
            new RecipeItem
            {
                Id = id,
                DishId = dishId,
                ProductId = productId,
                Quantity = quantity
            },
            cancellationToken);

        return updated
            ? ServiceResult<bool>.Success(true)
            : ServiceResult<bool>.NotFound("Recipe item was not found.");
    }

    public async Task<ServiceResult<bool>> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var deleted = await repository.DeleteAsync(id, cancellationToken);
        return deleted
            ? ServiceResult<bool>.Success(true)
            : ServiceResult<bool>.NotFound("Recipe item was not found.");
    }

    private static string? Validate(Guid dishId, Guid productId, decimal quantity)
    {
        return dishId == Guid.Empty || productId == Guid.Empty || quantity <= 0
            ? "DishId, ProductId and positive Quantity are required."
            : null;
    }
}
