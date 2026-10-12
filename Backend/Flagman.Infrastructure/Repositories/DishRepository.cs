using Flagman.Domain.Abstractions;
using Flagman.Domain.Model.Dish;
using Flagman.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Flagman.Infrastructure.Repositories;

public class DishRepository(AppDbContext db) : IDishRepository
{
    public async Task<IReadOnlyList<Dish>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await db.Dishes
            .Include(dish => dish.RecipeItems)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return db.Dishes
            .Include(dish => dish.RecipeItems)
            .FirstOrDefaultAsync(dish => dish.Id == id, cancellationToken);
    }

    public async Task AddAsync(Dish dish,  CancellationToken cancellationToken = default)
    {
        db.Dishes.Add(dish);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> UpdateAsync(Dish dish, CancellationToken cancellationToken = default)
    {
        var existing = await db.Dishes.FindAsync([dish.Id], cancellationToken);
        if (existing is null)
        {
            return false;
        }

        existing.Name = dish.Name;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var dish = await db.Dishes.FindAsync([id], cancellationToken);
        if (dish is null)
        {
            return false;
        }

        db.Dishes.Remove(dish);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
