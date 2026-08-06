#nullable disable
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace Tafe.Models
{
    public class StockTransaction : EntityTemplate
    {
        public int IngredientId { get; set; }
        public virtual Ingredient Ingredient { get; set; }

        [Column(TypeName = "decimal(18,3)")]
        public decimal Quantity { get; set; }

        public StockTransactionType Type { get; set; }

        [AllowNull]
        public int ReferenceId { get; set; }

        [AllowNull]
        public string UserId { get; set; }
        [AllowNull]
        public virtual ApplicationUser User { get; set; }

        [AllowNull]
        public string Notes { get; set; }
    }
}