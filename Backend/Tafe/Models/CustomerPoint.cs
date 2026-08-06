#nullable disable
namespace Tafe.Models
{
    public class CustomerPoint : EntityTemplate
    {
        public string CustomerId { get; set; }

        public virtual CustomerProfile Customer { get; set; }

        public int Points { get; set; }

        public string Reason { get; set; }

        public bool IsAddition { get; set; }
    }
}