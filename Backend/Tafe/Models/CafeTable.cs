#nullable disable
using System.ComponentModel.DataAnnotations;
namespace Tafe.Models
{
    public class CafeTable : EntityTemplate
    {
        [Required]
        [MaxLength(50)]
        public new string Name { get; set; }

        public int Capacity { get; set; }

        public bool IsOccupied { get; set; }

        public virtual ICollection<Order> Orders { get; set; } = [];
        public virtual ICollection<Reservation> Reservations { get; set; } = [];
    }
}