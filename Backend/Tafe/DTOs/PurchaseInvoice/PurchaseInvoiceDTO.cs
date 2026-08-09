#nullable disable

namespace Tafe.DTOs
{
    public class PurchaseInvoiceDTO
    {
        public int SupplierId { get; set; }
        public List<PurchaseInvoiceItemDTO> Items { get; set; } = new List<PurchaseInvoiceItemDTO>();
    }
}
