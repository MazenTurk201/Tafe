#nullable disable
public class ReservationDTO
{
    public int TableId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Notes { get; set; }
    public string CustomerId { get; set; }
    public int Guests { get; set; }
}