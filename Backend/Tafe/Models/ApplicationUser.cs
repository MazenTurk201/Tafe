#nullable disable
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Tafe.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        public string FirstName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}".Trim();
        [AllowNull]
        public string Address { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public virtual ICollection<Order> CashierOrders { get; set; } = [];
        public virtual ICollection<StockTransaction> StockTransactions { get; set; } = [];
        public virtual ICollection<Shift> Shifts { get; set; } = [];
    }
}
