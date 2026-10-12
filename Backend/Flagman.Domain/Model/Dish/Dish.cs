using Flagman.Domain.Abstractions;

namespace Flagman.Domain.Model.Dish;

public class Dish : Entity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<RecipeItem> RecipeItems { get; set; } = new List<RecipeItem>();
}
