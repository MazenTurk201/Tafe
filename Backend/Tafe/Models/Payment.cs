#nullable disable
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace Tafe.Models
{
    public class Payment : EntityTemplate
    {
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        public int ShiftId { get; set; }
        public virtual Shift Shift { get; set; }

        public PaymentMethod Method { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [AllowNull]
        public string TransactionNumber { get; set; }
    }
}