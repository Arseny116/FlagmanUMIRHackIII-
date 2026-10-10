using Flagman.Domain.Model;
using Microsoft.EntityFrameworkCore;

namespace Flagman.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<RecipeItem> RecipeItems => Set<RecipeItem>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Dish>()
            .HasMany(dish => dish.RecipeItems)
            .WithOne(item => item.Dish)
            .HasForeignKey(item => item.DishId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RecipeItem>()
            .HasOne(item => item.Product)
            .WithMany()
            .HasForeignKey(item => item.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}