using CSharpFunctionalExtensions;
using Flagman.Domain.Abstractions;

namespace Flagman.Domain.Model.Dish;

public class Dish : Flagman.Domain.Abstractions.Entity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<RecipeItem> RecipeItems { get; set; } = new List<RecipeItem>();

    private Dish()
    {
        Id = Guid.NewGuid();
        Name = default!;
        RecipeItems = default!;
    }

    public static Result<Dish> Create(string name, List<RecipeItem> recipeItems)
    {
       
        return Result.Success(new Dish
        {
            Name = name,
            RecipeItems = recipeItems
        });
    }
}
