#nullable disable
using System.ComponentModel.DataAnnotations;
using Tafe.Models;

public class EmployeeProfile : IProfileTemplate
{
    [Key]
    public string UserId { get; set; }

    public ApplicationUser User { get; set; }

    public decimal Salary { get; set; }

    public DateOnly HireDate { get; set; }

    public bool IsActive { get; set; }
    public virtual ICollection<Attendance> Attendances { get; set; } = [];

    public virtual ICollection<SalaryPayment> SalaryPayments { get; set; } = [];
}