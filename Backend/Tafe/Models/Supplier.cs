#nullable disable
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Tafe.Models
{
    public class Supplier : EntityTemplate
    {
        [Required]
        [MaxLength(150)]
        public new string Name { get; set; }

        [Phone]
        [AllowNull]
        public string Phone { get; set; }

        [EmailAddress]
        [AllowNull]
        public string Email { get; set; }

        [AllowNull]
        public string Address { get; set; }

        public virtual ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = [];
    }
}