#nullable disable
using System.Diagnostics.CodeAnalysis;

namespace Tafe.DTOs
{
    public class OrderUpdateDTO
    {
        public int Id { get; set; }

        [AllowNull]
        public string CustomerId { get; set; }

        public int? TableId { get; set; }

        public OrderType? OrderType { get; set; }

        public decimal? Discount { get; set; }

        public decimal? Tax { get; set; }

        public decimal? Service { get; set; }
    }
}
