#nullable disable
using System.ComponentModel.DataAnnotations;

namespace Tafe.DTOs
{
    public class SupplierCreateDTO
    {
        public string Name { get; set; }
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
        [DataType(DataType.PhoneNumber)]
        public string Phone { get; set; }
        public string Address { get; set; }
    }
}
