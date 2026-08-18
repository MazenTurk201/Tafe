#nullable disable
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Tafe.Models;

public class CustomerProfile : IProfileTemplate
{
    [Key]
    public string UserId { get; set; }

    public ApplicationUser User { get; set; }

    public int Points { get; set; }

    public decimal TotalSpent { get; set; }

    public bool Vip { get; set; }

    [AllowNull]
    public DateOnly BirthDate { get; set; }
    public virtual ICollection<Order> Orders { get; set; } = [];

    public virtual ICollection<CustomerPoint> PointsHistory { get; set; } = [];

    public virtual ICollection<Reservation> Reservations { get; set; } = [];
}