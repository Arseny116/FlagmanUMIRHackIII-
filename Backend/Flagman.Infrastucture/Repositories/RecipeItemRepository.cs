using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;
using Flagman.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Flagman.Infrastructure.Repositories;

public class RecipeItemRepository(AppDbContext db) : IRecipeItemRepository
{
    public async Task<IReadOnlyList<RecipeItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await db.RecipeItems
            .Include(item => item.Product)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public Task<RecipeItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return db.RecipeItems
            .Include(item => item.Product)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<RecipeItem>> GetByDishIdAsync(
        Guid dishId,
        CancellationToken cancellationToken = default)
    {
        return await db.RecipeItems
            .Where(item => item.DishId == dishId)
            .Include(item => item.Product)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(RecipeItem item, CancellationToken cancellationToken = default)
    {
        db.RecipeItems.Add(item);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> UpdateAsync(RecipeItem item, CancellationToken cancellationToken = default)
    {
        var existing = await db.RecipeItems.FindAsync([item.Id], cancellationToken);
        if (existing is null)
        {
            return false;
        }

        existing.DishId = item.DishId;
        existing.ProductId = item.ProductId;
        existing.Quantity = item.Quantity;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await db.RecipeItems.FindAsync([id], cancellationToken);
        if (item is null)
        {
            return false;
        }

        db.RecipeItems.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}