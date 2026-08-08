#nullable disable
using System.ComponentModel.DataAnnotations;

namespace Tafe.DTOs
{
    public class DeliveryProfileDTO
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
        public string Vehicle { get; set; }

        public decimal DeliveryFees { get; set; }
    }
}
