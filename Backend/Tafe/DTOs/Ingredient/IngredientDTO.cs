#nullable disable

namespace Tafe.DTOs
{
    public class IngredientDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal MinQuantityAlert { get; set; }
        public int UnitId { get; set; }
    }
}
