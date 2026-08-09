#nullable disable
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Tafe.DTOs
{
    public class OrderItemCreateDTO
    {
        public int ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        public decimal Discount { get; set; }

        [AllowNull]
        public string Notes { get; set; }
    }
}
