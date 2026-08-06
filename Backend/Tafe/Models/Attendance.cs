#nullable disable
using System.Diagnostics.CodeAnalysis;

namespace Tafe.Models
{
    public class Attendance : EntityTemplate
    {
        public int EmployeeProfileId { get; set; }

        public virtual EmployeeProfile Employee { get; set; }

        public DateTime CheckIn { get; set; }
        [AllowNull]
        public DateTime CheckOut { get; set; }
        [AllowNull]
        public string Notes { get; set; }
    }
}