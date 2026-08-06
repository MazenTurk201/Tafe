#nullable disable
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using System.Xml;

namespace Tafe.Models
{
    public class Order : EntityTemplate
    {
        [Required]
        public string OrderNumber { get; set; } = Guid.NewGuid().ToString("N")[..8].ToUpper();

        [AllowNull]
        public string CustomerId { get; set; }
        [AllowNull]
        public virtual CustomerProfile Customer { get; set; }

        [Required]
        public string CashierId { get; set; }
        public virtual ApplicationUser Cashier { get; set; }

        [AllowNull]
        public int TableId { get; set; }
        [AllowNull]
        public virtual CafeTable Table { get; set; }

        public OrderType OrderType { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Tax { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Service { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        public virtual ICollection<OrderItem> Items { get; set; } = [];
        public virtual ICollection<Payment> Payments { get; set; } = [];
    }
}