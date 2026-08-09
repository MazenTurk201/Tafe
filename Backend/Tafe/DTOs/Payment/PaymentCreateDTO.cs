public class PaymentCreateDTO
{
    public int OrderId { get; set; }
    public PaymentMethod Method { get; set; }
    public decimal Amount { get; set; }
    public string? TransactionNumber { get; set; }
}