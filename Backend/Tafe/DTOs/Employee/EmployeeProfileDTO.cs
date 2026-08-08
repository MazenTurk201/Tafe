#nullable disable
using System.ComponentModel.DataAnnotations;

namespace Tafe.DTOs
{
    public class EmployeeProfileDTO
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
        public decimal Salary { get; set; }
        public DateOnly HireDate { get; set; }
        public bool IsActive { get; set; }
    }
}
