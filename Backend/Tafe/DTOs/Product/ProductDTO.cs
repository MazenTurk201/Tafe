#nullable disable
using Tafe.Models;

namespace Tafe.DTOs
{
    public class ProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        public List<ProductIngredient> IngredientsId { get; set; }
        public ICollection<ProductIngredient> Ingredients { get; internal set; }
    }
}
