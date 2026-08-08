#nullable disable
using Tafe.DTO;

namespace Tafe.DTOs
{
    public class DeliveryCreateDTO
    {
        public AppUserRegisterDTO User { get; set; } = null;
        public string Vehicle { get; set; }
        public decimal DeliveryFees { get; set; }
    }
}
