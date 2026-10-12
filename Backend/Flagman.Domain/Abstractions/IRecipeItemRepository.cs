using Flagman.Domain.Model.Dish;

namespace Flagman.Domain.Abstractions;

public interface IRecipeItemRepository : IRepository<RecipeItem>
{
    Task<IReadOnlyList<RecipeItem>> GetByDishIdAsync(Guid dishId, CancellationToken cancellationToken = default);
}