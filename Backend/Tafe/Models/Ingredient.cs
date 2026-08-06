#nullable disable
using Tafe.Models;

public class Ingredient : EntityTemplate
{
    public decimal Quantity { get; set; }      // الموجود بالمخزن

    public int UnitId { get; set; }
    public Unit Unit { get; set; }

    public decimal MinQuantityAlert { get; set; }

    public ICollection<ProductIngredient> Products { get; set; } = [];
    public virtual ICollection<StockTransaction> StockTransactions { get; set; } = [];

    public virtual ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = [];
}