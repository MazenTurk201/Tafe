#nullable disable

using Tafe.Models;

namespace Tafe.DTOs
{
    public class ProductCreateDTO
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        public List<ProductIngredient> IngredientsId { get; set; }
    }
}
