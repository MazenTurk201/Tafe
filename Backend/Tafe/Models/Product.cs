#nullable disable
using Tafe.Models;

public class Product : EntityTemplate
{
    public decimal Price { get; set; }

    public int CategoryId { get; set; }
    public Category Category { get; set; }

    public ICollection<ProductIngredient> Ingredients { get; set; } = [];
}