using Flagman.Application.Common;
using Flagman.Domain.Model.Dish;

namespace Flagman.Application.Abstractions.Services;

public interface IDishService
{
    Task<IReadOnlyList<Dish>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceResult<Dish>> CreateAsync(string name, List<RecipeItem> recipeItems, CancellationToken cancellationToken = default);
    Task<ServiceResult<bool>> UpdateAsync(Guid id, string name, List<RecipeItem> recipeItems, CancellationToken cancellationToken = default);
    Task<ServiceResult<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
