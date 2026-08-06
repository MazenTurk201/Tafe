#nullable disable
using System.Diagnostics.CodeAnalysis;

namespace Tafe.Models
{
    public class Reservation : EntityTemplate
    {
        public int TableId { get; set; }
        public virtual CafeTable Table { get; set; }

        public string CustomerId { get; set; }
        public virtual CustomerProfile Customer { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public int Guests { get; set; }

        [AllowNull]
        public string Notes { get; set; }
    }
}