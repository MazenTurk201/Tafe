#nullable disable
public class InventoryCountCreateDTO
{
    public int IngredientId { get; set; }
    public decimal Quantity { get; set; }
    public string UserId { get; set; }
    public string Notes { get; set; }
    public StockTransactionType Type { get; set; }
}
