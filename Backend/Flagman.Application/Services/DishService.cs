using Flagman.Application.Abstractions.Services;
using Flagman.Application.Common;
using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;

namespace Flagman.Application.Services;

public sealed class DishService(IDishRepository repository) : IDishService
{
    public Task<IReadOnlyList<Dish>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return repository.GetAllAsync(cancellationToken);
    }

    public Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return repository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<ServiceResult<Dish>> CreateAsync(
        string name,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return ServiceResult<Dish>.Failure("Dish name is required.");
        }

        var dish = new Dish { Name = name.Trim() };
        await repository.AddAsync(dish, cancellationToken);
        return ServiceResult<Dish>.Success(dish);
    }

    public async Task<ServiceResult<bool>> UpdateAsync(
        Guid id,
        string name,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return ServiceResult<bool>.Failure("Dish name is required.");
        }

        var updated = await repository.UpdateAsync(
            new Dish { Id = id, Name = name.Trim() },
            cancellationToken);

        return updated
            ? ServiceResult<bool>.Success(true)
            : ServiceResult<bool>.NotFound("Dish was not found.");
    }

    public async Task<ServiceResult<bool>> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var deleted = await repository.DeleteAsync(id, cancellationToken);
        return deleted
            ? ServiceResult<bool>.Success(true)
            : ServiceResult<bool>.NotFound("Dish was not found.");
    }
}
