#nullable disable
using System.ComponentModel.DataAnnotations.Schema;

namespace Tafe.Models
{
    public class PurchaseInvoice : EntityTemplate
    {
        public string InvoiceNumber { get; set; }

        public int SupplierId { get; set; }
        public virtual Supplier Supplier { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        public virtual ICollection<PurchaseInvoiceItem> Items { get; set; } = [];
    }
}