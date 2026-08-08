#nullable disable
namespace Tafe.DTOs
{
    public class DeliveryProfileUpdateDTO
    {
        public string UserId { get; set; } = null;
        public string Vehicle { get; set; }
        public decimal DeliveryFees { get; set; }
    }
}
