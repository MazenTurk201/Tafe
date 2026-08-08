#nullable disable
using System.ComponentModel.DataAnnotations;

namespace Tafe.DTOs
{
    public class CustomerProfileDTO
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
        public int Points { get; set; }
        public decimal TotalSpent { get; set; }
        public bool Vip { get; set; }
        [DataType(DataType.DateTime)]
        public DateTime BirthDate { get; set; }
    }
}
