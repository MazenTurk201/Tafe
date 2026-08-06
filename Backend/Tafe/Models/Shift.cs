#nullable disable
using System.ComponentModel.DataAnnotations.Schema;

namespace Tafe.Models
{
    public class Shift : EntityTemplate
    {
        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public DateTime OpenedAt { get; set; }

        public DateTime? ClosedAt { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OpeningCash { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ClosingCash { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ExpectedCash { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Difference { get; set; }

        public bool IsClosed { get; set; }

        public virtual ICollection<Payment> Payments { get; set; } = [];
    }
}