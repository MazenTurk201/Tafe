using Tafe.DTO;

namespace Tafe.DTOs
{
    public class EmployeeCreateDTO
    {
        public AppUserRegisterDTO User { get; set; } = null!;
        public decimal Salary { get; set; }
        public DateOnly HireDate { get; set; }
    }
}
