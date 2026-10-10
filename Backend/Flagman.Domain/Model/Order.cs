namespace Flagman.Domain.Model
{
    public class Order
    {
        public Guid Id { get; set; }

        public List<Dish> Dishes { get; set; } = new List<Dish>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        private List<Dictionary<Product, decimal>> _totalWeight;

        public  List<Dictionary<Product, decimal>> TotalWeigth
        {
            get { return _totalWeight; }  
            set {
                var totalRecipeItems = Dishes.SelectMany(x =>x.RecipeItems).ToList();


                foreach (var recipeItem in totalRecipeItems)
                {
                    var product = recipeItem.Product;
                    var quantity = recipeItem.Quantity;
                    var existingProduct = _totalWeight.FirstOrDefault(x => x.ContainsKey(product));
                    if (existingProduct != null)
                    {
                        existingProduct[product] += quantity;
                    }
                    else
                    {
                        _totalWeight.Add(new Dictionary<Product, decimal> { { product, quantity } });
                    }
                }

            }
        }



    }
}
