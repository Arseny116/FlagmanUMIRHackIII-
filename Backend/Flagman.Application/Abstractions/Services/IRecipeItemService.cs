using Flagman.Application.Common;
using Flagman.Domain.Model;

namespace Flagman.Application.Abstractions.Services;

public interface IRecipeItemService
{
    Task<IReadOnlyList<RecipeItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<RecipeItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RecipeItem>> GetByDishIdAsync(Guid dishId, CancellationToken cancellationToken = default);
    Task<ServiceResult<RecipeItem>> CreateAsync(
        Guid dishId,
        Guid productId,
        decimal quantity,
        CancellationToken cancellationToken = default);
    Task<ServiceResult<bool>> UpdateAsync(
        Guid id,
        Guid dishId,
        Guid productId,
        decimal quantity,
        CancellationToken cancellationToken = default);
    Task<ServiceResult<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
