using Flagman.Domain.Abstractions;

namespace Flagman.Domain.Model;

public class RecipeItem : Entity
{
    public Guid DishId { get; set; }
    public Dish Dish { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    //кол-во продукта в блюде
    public decimal Quantity { get; set; }
}