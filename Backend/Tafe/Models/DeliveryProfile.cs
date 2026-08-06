#nullable disable
using System.ComponentModel.DataAnnotations;
using Tafe.Models;

public class DeliveryProfile
{
    [Key]
    public string UserId { get; set; }

    public ApplicationUser User { get; set; }

    public string Vehicle { get; set; }

    public decimal DeliveryFees { get; set; }
}