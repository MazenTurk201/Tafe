#nullable disable

namespace Tafe.DTOs
{
    public class CafeTableDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Capacity { get; set; }
        public bool IsOccupied { get; set; }
    }
}
