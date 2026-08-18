#nullable disable
using System.ComponentModel.DataAnnotations;
using Tafe.DTO;

namespace Tafe.DTOs
{
    public class CustomerCreateDTO
    {
        public AppUserRegisterDTO User { get; set; } = null;
        public int Points { get; set; }
        public bool Vip { get; set; }
        [DataType(DataType.DateTime)]
        public DateTime BirthDate { get; set; }
        public string Address { get; set; }
    }
}
