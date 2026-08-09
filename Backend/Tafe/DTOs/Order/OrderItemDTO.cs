#nullable disable
using System.Diagnostics.CodeAnalysis;

namespace Tafe.DTOs
{
    public class OrderItemDTO
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int ProductId { get; set; }

        [AllowNull]
        public string ProductName { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Discount { get; set; }

        public decimal Total { get; set; }

        [AllowNull]
        public string Notes { get; set; }
    }
}
