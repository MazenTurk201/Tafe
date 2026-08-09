#nullable disable

namespace Tafe.DTOs
{
    public class IngredientCreateDTO
    {
        public string Name { get; set; }
        public decimal Quantity { get; set; }
        public decimal MinQuantityAlert { get; set; }
        public int UnitId { get; set; }
    }
}
