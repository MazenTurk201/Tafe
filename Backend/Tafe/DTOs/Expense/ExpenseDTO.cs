#nullable disable

namespace Tafe.DTOs
{
    public class ExpenseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public ExpenseType Type { get; set; }
        public string Notes { get; set; }
    }
}
