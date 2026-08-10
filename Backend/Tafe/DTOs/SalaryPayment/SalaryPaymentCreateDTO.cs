public class SalaryPaymentCreateDTO
{
    public required string EmployeeProfileId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaidAt { get; set; }
    public string? Notes { get; set; }
}