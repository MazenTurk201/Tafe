#nullable disable
using System.Diagnostics.CodeAnalysis;
using Tafe.Models;

namespace Tafe.DTOs
{
    public class OrderDTO
    {
        public int Id { get; set; }

        public string OrderNumber { get; set; }

        [AllowNull]
        public string CustomerId { get; set; }

        [AllowNull]
        public string CustomerName { get; set; }

        public string CashierId { get; set; }

        [AllowNull]
        public string CashierName { get; set; }

        public int? TableId { get; set; }

        [AllowNull]
        public string TableName { get; set; }

        public string OrderType { get; set; }

        public string Status { get; set; }

        public decimal SubTotal { get; set; }

        public decimal Discount { get; set; }

        public decimal Tax { get; set; }

        public decimal Service { get; set; }

        public decimal Total { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public List<OrderItemDTO> Items { get; set; } = [];
        public ICollection<Payment> Payments { get; set; }
    }
}
