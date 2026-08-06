#nullable disable
using System.ComponentModel.DataAnnotations.Schema;

namespace Tafe.Models
{
    public class PurchaseInvoiceItem : EntityTemplate
    {
        public int PurchaseInvoiceId { get; set; }
        public virtual PurchaseInvoice PurchaseInvoice { get; set; }

        public int IngredientId { get; set; }
        public virtual Ingredient Ingredient { get; set; }

        [Column(TypeName = "decimal(18,3)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }
    }
}