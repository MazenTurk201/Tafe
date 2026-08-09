#nullable disable

namespace Tafe.DTOs
{
    public class PurchaseInvoiceItemDTO
    {
        public int IngredientId { get; set; }
        public virtual Ingredient Ingredient { get; set; }
        public decimal Quantity { get; set; }
        public int UnitId { get; set; }
        public virtual Unit Unit { get; set; }
        public decimal Price { get; set; }
    }
}
