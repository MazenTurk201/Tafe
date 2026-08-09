#nullable disable
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
namespace Tafe.Models
{
    public class Expense : EntityTemplate
    {
        [Required]
        [MaxLength(100)]
        public new string Name { get; set; }
        public ExpenseType Type { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        [DataType(DataType.DateTime)]
        public DateTime ExpenseDate { get; set; }
        [AllowNull]
        public string Notes { get; set; }
    }
}