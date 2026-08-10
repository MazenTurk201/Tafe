#nullable disable
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace Tafe.Models
{
    public class SalaryPayment : EntityTemplate
    {
        public string EmployeeProfileId { get; set; }

        public virtual EmployeeProfile Employee { get; set; }

        public int Month { get; set; }

        public int Year { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime PaidAt { get; set; }

        [AllowNull]
        public string Notes { get; set; }
    }
}