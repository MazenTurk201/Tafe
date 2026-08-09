using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tafe.Models
{
    public class Order : EntityTemplate
    {
        [Required]
        public string OrderNumber { get; set; }
            = Guid.NewGuid().ToString("N")[..8].ToUpper();

        // Customer is optional => Guest Order
        public string? CustomerId { get; set; }

        public virtual CustomerProfile? Customer { get; set; }

        // The employee who created the order
        [Required]
        public required string CashierId { get; set; }

        public virtual required ApplicationUser Cashier { get; set; }

        // Optional for TakeAway / Delivery
        public int? TableId { get; set; }

        public virtual CafeTable? Table { get; set; }

        public OrderType OrderType { get; set; }

        public OrderStatus Status { get; set; }
            = OrderStatus.Pending;

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