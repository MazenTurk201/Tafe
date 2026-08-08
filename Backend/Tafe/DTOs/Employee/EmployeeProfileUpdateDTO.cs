using System.ComponentModel.DataAnnotations;

namespace Tafe.DTOs
{
    public class EmployeeProfileUpdateDTO
    {
        public string UserId { get; set; } = null!;
        public decimal Salary { get; set; }
        [DataType(DataType.DateTime)]
        public DateOnly HireDate { get; set; }
        public bool IsActive { get; set; }
    }
}
