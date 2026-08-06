#nullable disable
using System.Diagnostics.CodeAnalysis;
using Tafe.Models;

public class InventoryCount : EntityTemplate
{
    public int IngredientId { get; set; }

    public virtual Ingredient Ingredient { get; set; }

    public decimal SystemQuantity { get; set; }

    public decimal ActualQuantity { get; set; }

    public decimal Difference { get; set; }

    public string UserId { get; set; }

    public virtual ApplicationUser User { get; set; }

    [AllowNull]
    public string Notes { get; set; }
}