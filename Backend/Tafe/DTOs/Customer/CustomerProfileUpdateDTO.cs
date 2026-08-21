#nullable disable
using System.ComponentModel.DataAnnotations;

namespace Tafe.DTOs
{
    public class CustomerProfileUpdateDTO
    {
        public string UserId { get; set; } = null;
        public int Points { get; set; }
        public decimal TotalSpent { get; set; }
        public bool Vip { get; set; }
        [DataType(DataType.Date)]
        public DateOnly BirthDate { get; set; }
        public string Address { get; set; }
    }
}
